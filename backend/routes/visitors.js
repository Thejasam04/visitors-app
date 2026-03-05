const express              = require('express');
const router               = express.Router();
const db                   = require('../db');
const auth                 = require('../middleware/auth');
const { uploadPhoto }      = require('../services/s3');
const { sendApprovalRequest } = require('../services/email');

// ── POST /api/visitors — Submit visit request ─────────
router.post('/', auth, async (req, res) => {
  try {
    const {
      name, phone, address,
      purpose, host_id,
      preferred_date, preferred_time,
      photo
    } = req.body;

    // Validate
    if (!name || !phone || !address || !purpose || !host_id || !preferred_date || !preferred_time) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Upload photo to S3
    let photo_url = null;
    if (photo) {
      photo_url = await uploadPhoto(photo);
    }

    // Save visitor
    const [result] = await db.query(`
      INSERT INTO visitors
        (user_id, name, phone, address, purpose,
         host_id, preferred_date, preferred_time, photo_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [req.user.id, name, phone, address, purpose,
        host_id, preferred_date, preferred_time, photo_url]);

    const visitorId = result.insertId;

    // Get host details
    const [hosts] = await db.query(
      'SELECT * FROM hosts WHERE id = ?', [host_id]
    );

    if (hosts.length === 0) {
      return res.status(404).json({ error: 'Host not found' });
    }

    // Send approval email to host
    await sendApprovalRequest(hosts[0], {
      name, phone, purpose,
      preferred_date, preferred_time,
      photo_url,
      id : visitorId
    }, visitorId);

    res.status(201).json({
      message    : '✅ Visit request submitted! Waiting for host approval.',
      visitor_id : visitorId
    });
  } catch (err) {
    console.error('Submit visit error:', err.message);
    res.status(500).json({ error: 'Failed to submit visit request' });
  }
});

// ── GET /api/visitors/my — Get my visits ──────────────
router.get('/my', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, h.name as host_name, h.department
      FROM visitors v
      JOIN hosts h ON v.host_id = h.id
      WHERE v.user_id = ?
      ORDER BY v.created_at DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (err) {
    console.error('Get my visits error:', err.message);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

router.get('/:id/pass', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM visitor_passes WHERE visitor_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Pass not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pass' });
  }
});

// ── GET /api/visitors/stats — Dashboard stats ─────────
router.get('/stats', auth, async (req, res) => {
  try {
    const [[totalToday]] = await db.query(`
      SELECT COUNT(*) as count FROM visitors
      WHERE DATE(check_in_time) = CURDATE()
    `);

    const [[currentlyInside]] = await db.query(`
      SELECT COUNT(*) as count FROM visitors
      WHERE status = 'checked-in'
    `);

    const [[totalThisMonth]] = await db.query(`
      SELECT COUNT(*) as count FROM visitors
      WHERE MONTH(created_at) = MONTH(CURDATE())
      AND YEAR(created_at) = YEAR(CURDATE())
    `);

    const [[pending]] = await db.query(`
      SELECT COUNT(*) as count FROM visitors
      WHERE status = 'pending'
    `);

    res.json({
      total_today      : totalToday.count,
      currently_inside : currentlyInside.count,
      total_this_month : totalThisMonth.count,
      pending_approval : pending.count
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── PUT /api/visitors/:id/checkin — Check in ──────────
router.put('/:id/checkin', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM visitors WHERE id = ?', [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    if (rows[0].status !== 'approved') {
      return res.status(400).json({
        error: 'Visit must be approved before check-in'
      });
    }

    await db.query(`
      UPDATE visitors
      SET status = 'checked-in', check_in_time = NOW()
      WHERE id = ?
    `, [req.params.id]);

    res.json({ message: '✅ Checked in successfully' });
  } catch (err) {
    console.error('Check-in error:', err.message);
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// ── PUT /api/visitors/:id/checkout — Check out ────────
router.put('/:id/checkout', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM visitors WHERE id = ?', [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    if (rows[0].status !== 'checked-in') {
      return res.status(400).json({ error: 'Visitor is not checked in' });
    }

    await db.query(`
      UPDATE visitors
      SET status = 'checked-out', check_out_time = NOW()
      WHERE id = ?
    `, [req.params.id]);

    const duration = Math.round(
      (new Date() - new Date(rows[0].check_in_time)) / 60000
    );

    res.json({
      message  : '✅ Checked out successfully',
      duration : `${duration} minutes`
    });
  } catch (err) {
    console.error('Check-out error:', err.message);
    res.status(500).json({ error: 'Failed to check out' });
  }
});

module.exports = router;