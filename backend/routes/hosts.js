const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    console.log("➡️ /api/hosts endpoint hit");

    const [rows] = await db.query('SELECT * FROM hosts');

    console.log("✅ Query finished. Rows:", rows.length);

    res.json(rows);

  } catch (err) {
    console.error("❌ HOSTS ERROR:", err);

    res.status(500).json({
      error: "Failed to fetch hosts",
      message: err.message,
      code: err.code
    });
  }
});

module.exports = router;