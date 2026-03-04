const express                  = require('express');
const router                   = express.Router();
const db                       = require('../db');
const { generateQRCode }       = require('../services/qrcode');
const { sendVisitorPass, sendRejectionEmail } = require('../services/email');

// ── GET /api/approval/:id/approve ─────────────────────
// Host clicks Approve in email
router.get('/:id/approve', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, h.name as host_name, u.email as visitor_email
      FROM visitors v
      JOIN hosts h ON v.host_id = h.id
      JOIN users u ON v.user_id = u.id
      WHERE v.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).send('Visit request not found');
    }

    if (rows[0].status !== 'pending') {
      return res.send(`
        <h2>This request has already been ${rows[0].status}</h2>
      `);
    }

    // Show approval form to set timings
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Approve Visit</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 500px;
                 margin: 40px auto; padding: 20px; }
          h2   { color: #2563eb; }
          label { display: block; margin: 10px 0 5px; color: #374151; }
          input { width: 100%; padding: 10px; border: 1px solid #d1d5db;
                  border-radius: 6px; font-size: 16px; }
          button { background: #16a34a; color: white; padding: 12px 24px;
                   border: none; border-radius: 6px; font-size: 16px;
                   cursor: pointer; margin-top: 20px; width: 100%; }
          .info  { background: #f3f4f6; padding: 16px;
                   border-radius: 8px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h2>✅ Approve Visit Request</h2>
        <div class="info">
          <p><strong>Visitor:</strong> ${rows[0].name}</p>
          <p><strong>Purpose:</strong> ${rows[0].purpose}</p>
          <p><strong>Preferred Date:</strong> ${rows[0].preferred_date}</p>
          <p><strong>Preferred Time:</strong> ${rows[0].preferred_time}</p>
        </div>
        <form action="/api/approval/${req.params.id}/confirm" method="POST">
          <label>Allowed Start Time</label>
          <input type="datetime-local" name="start_time" required />
          <label>Allowed End Time</label>
          <input type="datetime-local" name="end_time" required />
          <button type="submit">✅ Confirm Approval</button>
        </form>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Approve error:', err.message);
    res.status(500).send('Something went wrong');
  }
});

// ── POST /api/approval/:id/confirm ────────────────────
// Host submits approval form with timings
router.post('/:id/confirm', async (req, res) => {
  try {
    const { start_time, end_time } = req.body;

    const [rows] = await db.query(`
      SELECT v.*, h.name as host_name, u.email as visitor_email
      FROM visitors v
      JOIN hosts h ON v.host_id = h.id
      JOIN users u ON v.user_id = u.id
      WHERE v.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).send('Visit not found');
    }

    const visitor = rows[0];

    // Update status to approved
    await db.query(
      "UPDATE visitors SET status = 'approved' WHERE id = ?",
      [req.params.id]
    );

    // Generate QR Code
    const qrData = {
      visitor_id : visitor.id,
      name       : visitor.name,
      date       : visitor.preferred_date,
      valid_from : start_time,
      valid_to   : end_time
    };

    const qrCodeImage = await generateQRCode(qrData);

    // Save pass to DB
    await db.query(`
      INSERT INTO visitor_passes
        (visitor_id, qr_code, approved_start_time, approved_end_time)
      VALUES (?, ?, ?, ?)
    `, [visitor.id, qrCodeImage, start_time, end_time]);

    // Get the saved pass
    const [passes] = await db.query(
      'SELECT * FROM visitor_passes WHERE visitor_id = ?',
      [visitor.id]
    );

    // Send visitor pass email
    await sendVisitorPass(
      visitor.visitor_email,
      visitor,
      passes[0],
      qrCodeImage
    );

    // Show success page to host
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Approved!</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 500px;
                 margin: 40px auto; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <h2 style="color: #16a34a;">✅ Visit Approved!</h2>
        <p>Visitor pass has been sent to <strong>${visitor.visitor_email}</strong></p>
        <p>Visit window: <strong>${start_time}</strong> to <strong>${end_time}</strong></p>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Confirm approval error:', err.message);
    res.status(500).send('Something went wrong');
  }
});

// ── GET /api/approval/:id/reject ──────────────────────
router.get('/:id/reject', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, h.name as host_name, u.email as visitor_email
      FROM visitors v
      JOIN hosts h ON v.host_id = h.id
      JOIN users u ON v.user_id = u.id
      WHERE v.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).send('Visit not found');
    }

    await db.query(
      "UPDATE visitors SET status = 'rejected' WHERE id = ?",
      [req.params.id]
    );

    await sendRejectionEmail(rows[0].visitor_email, rows[0]);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rejected</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 500px;
                 margin: 40px auto; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <h2 style="color: #dc2626;">❌ Visit Rejected</h2>
        <p>The visitor has been notified.</p>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Reject error:', err.message);
    res.status(500).send('Something went wrong');
  }
});

module.exports = router;