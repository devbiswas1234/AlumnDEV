import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Middleware: Admin only
 */
const requireAdmin = requireAuth("ADMIN");

/**
 * Get all users
 */
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * View unverified alumni
 */
router.get("/alumni/pending", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ap.*, u.name, u.email
       FROM alumni_profiles ap
       JOIN users u ON ap.user_id = u.id
       WHERE ap.verified = FALSE`
    );
    res.json({ alumni: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Verify alumni
 */
router.patch("/alumni/:id/verify", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE alumni_profiles
       SET verified = TRUE
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Alumni not found" });

    res.json({ message: "Alumni verified", alumni: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Platform statistics
 */
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const stats = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM alumni_profiles WHERE verified=TRUE"),
      pool.query("SELECT COUNT(*) FROM mentorship_requests"),
      pool.query("SELECT COUNT(*) FROM jobs"),
      pool.query("SELECT COUNT(*) FROM events")
    ]);

    res.json({
      users: stats[0].rows[0].count,
      verified_alumni: stats[1].rows[0].count,
      mentorship_requests: stats[2].rows[0].count,
      jobs: stats[3].rows[0].count,
      events: stats[4].rows[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
