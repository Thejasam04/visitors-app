const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const db        = require('../db');
const adminAuth = require('../middleware/adminAuth');
require('dotenv').config();

// ── POST /api/admin/login ─────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find admin
    const [rows] = await db.query(
      'SELECT * FROM admins WHERE email = ?', [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token with isAdmin flag
    const token = jwt.sign(
      { id: admin.id, email: admin.email, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message : '✅ Login successful',
      token   : token,
      admin   : { id: admin.id, email: admin.email, name: admin.name }
    });
  } catch (err) {
    console.error('Admin login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── GET /api/admin/dashboard ──────────────────────────
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [[totalVisitors]] = await db.query(
      'SELECT COUNT(*) as count FROM visitors'
    );

    const [[todayVisitors]] = await db.query(
      'SELECT COUNT(*) as count FROM visitors WHERE DATE(created_at) = CURDATE()'
    );

    const [[pendingApprovals]] = await db.query(
      "SELECT COUNT(*) as count FROM visitors WHERE status = 'pending'"
    );

    const [[totalHosts]] = await db.query(
      'SELECT COUNT(*) as count FROM hosts'
    );

    const [[checkedIn]] = await db.query(
      "SELECT COUNT(*) as count FROM visitors WHERE status = 'checked-in'"
    );

    const [recentVisitors] = await db.query(`
      SELECT v.*, h.name as host_name, h.department
      FROM visitors v
      JOIN hosts h ON v.host_id = h.id
      ORDER BY v.created_at DESC
      LIMIT 5
    `);

    res.json({
      stats: {
        total_visitors   : totalVisitors.count,
        today_visitors   : todayVisitors.count,
        pending_approvals: pendingApprovals.count,
        total_hosts      : totalHosts.count,
        checked_in       : checkedIn.count
      },
      recent_visitors: recentVisitors
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// ── GET /api/admin/visitors ───────────────────────────
router.get('/visitors', adminAuth, async (req, res) => {
  try {
    const { status, date, search } = req.query;

    let query = `
      SELECT v.*, h.name as host_name, h.department, u.email as visitor_email
      FROM visitors v
      JOIN hosts h ON v.host_id = h.id
      JOIN users u ON v.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND v.status = ?';
      params.push(status);
    }

    if (date) {
      query += ' AND DATE(v.preferred_date) = ?';
      params.push(date);
    }

    if (search) {
      query += ' AND (v.name LIKE ? OR h.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY v.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get all visitors error:', err.message);
    res.status(500).json({ error: 'Failed to fetch visitors' });
  }
});

// ── GET /api/admin/hosts ──────────────────────────────
router.get('/hosts', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM hosts ORDER BY name ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Get hosts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch hosts' });
  }
});

// ── POST /api/admin/hosts ─────────────────────────────
router.post('/hosts', adminAuth, async (req, res) => {
  try {
    const { name, department, email } = req.body;

    if (!name || !department || !email) {
      return res.status(400).json({
        error: 'Name, department and email are required'
      });
    }

    const [result] = await db.query(
      'INSERT INTO hosts (name, department, email) VALUES (?, ?, ?)',
      [name, department, email]
    );

    res.status(201).json({
      message : '✅ Host added successfully',
      id      : result.insertId
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Add host error:', err.message);
    res.status(500).json({ error: 'Failed to add host' });
  }
});

// ── PUT /api/admin/hosts/:id ──────────────────────────
router.put('/hosts/:id', adminAuth, async (req, res) => {
  try {
    const { name, department, email } = req.body;

    if (!name || !department || !email) {
      return res.status(400).json({
        error: 'Name, department and email are required'
      });
    }

    const [result] = await db.query(
      'UPDATE hosts SET name = ?, department = ?, email = ? WHERE id = ?',
      [name, department, email, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Host not found' });
    }

    res.json({ message: '✅ Host updated successfully' });
  } catch (err) {
    console.error('Update host error:', err.message);
    res.status(500).json({ error: 'Failed to update host' });
  }
});

// ── DELETE /api/admin/hosts/:id ───────────────────────
router.delete('/hosts/:id', adminAuth, async (req, res) => {
  try {
    // Check if host has visitors
    const [visitors] = await db.query(
      'SELECT COUNT(*) as count FROM visitors WHERE host_id = ?',
      [req.params.id]
    );

    if (visitors[0].count > 0) {
      return res.status(400).json({
        error: `Cannot delete — host has ${visitors[0].count} visitor records`
      });
    }

    const [result] = await db.query(
      'DELETE FROM hosts WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Host not found' });
    }

    res.json({ message: '✅ Host deleted successfully' });
  } catch (err) {
    console.error('Delete host error:', err.message);
    res.status(500).json({ error: 'Failed to delete host' });
  }
});

// ── GET /api/admin/reports ────────────────────────────
router.get('/reports', adminAuth, async (req, res) => {
  try {
    // Visitors by status
    const [byStatus] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM visitors
      GROUP BY status
    `);

    // Visitors by host
    const [byHost] = await db.query(`
      SELECT h.name as host_name, h.department, COUNT(*) as count
      FROM visitors v
      JOIN hosts h ON v.host_id = h.id
      GROUP BY v.host_id
      ORDER BY count DESC
    `);

    // Visitors by date (last 7 days)
    const [byDate] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM visitors
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({ byStatus, byHost, byDate });
  } catch (err) {
    console.error('Reports error:', err.message);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

module.exports = router;