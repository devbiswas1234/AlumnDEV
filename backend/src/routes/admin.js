import express from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * =========================
 * USERS (ADMIN)
 * =========================
 */

/**
 * Get all users
 */
router.get("/users", requireAuth(), requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, name, email, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({ users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * Disable user (spam / fake)
 */
router.post("/users/:id/disable", requireAuth(), requireAdmin, async (req, res) => {
  try {
    await pool.query(
      `UPDATE users SET is_active = FALSE WHERE id = $1`,
      [req.params.id]
    );

    res.json({ message: "User disabled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to disable user" });
  }
});

/**
 * =========================
 * ALUMNI VERIFICATION (ADMIN)
 * =========================
 */

/**
 * Get pending alumni (frontend-friendly)
 */
router.get("/alumni/pending", requireAuth(), requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        u.id AS user_id,
        u.name,
        u.email,
        ap.department,
        ap.passing_year,
        ap.linkedin_url,
        u.created_at
      FROM alumni_profiles ap
      JOIN users u ON u.id = ap.user_id
      WHERE ap.verified = FALSE
      ORDER BY u.created_at DESC
    `);

    res.json({ alumni: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending alumni" });
  }
});

/**
 * Verify alumni (AUDITED)
 */
router.patch("/alumni/:id/verify", requireAuth(), requireAdmin, async (req, res) => {
  try {
    const alumniId = req.params.id;
    const adminId = req.user.id;

    const result = await pool.query(`
      UPDATE alumni_profiles
      SET verified = TRUE
      WHERE user_id = $1 AND verified = FALSE
      RETURNING user_id
    `, [alumniId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Alumni not found or already verified"
      });
    }

    await pool.query(`
      INSERT INTO alumni_verifications (alumni_id, admin_id)
      VALUES ($1, $2)
    `, [alumniId, adminId]);

    res.json({ message: "Alumni verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});

/**
 * Approve alumni
 */
router.post(
  "/alumni/:id/approve",
  requireAuth("ADMIN"),
  async (req, res) => {
    const { id } = req.params;

    await pool.query(
      `UPDATE users SET approved = true WHERE id = $1 AND role = 'ALUMNI'`,
      [id]
    );

    res.json({ message: "Alumni approved" });
  }
);

/**
 * Reject alumni (hard delete)
 */
router.post("/alumni/:id/reject", requireAuth(), requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    await pool.query(`DELETE FROM alumni_profiles WHERE user_id = $1`, [userId]);
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);

    res.json({ message: "Alumni rejected and removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject alumni" });
  }
});

/**
 * =========================
 * PLATFORM STATS (ADMIN)
 * =========================
 */

router.get("/stats", requireAuth(), requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'ALUMNI') AS alumni,
        (SELECT COUNT(*) FROM users WHERE role = 'STUDENT') AS students,
        (SELECT COUNT(*) FROM alumni_profiles WHERE verified = TRUE) AS verified_alumni,
        (SELECT COUNT(*) FROM alumni_profiles WHERE verified = FALSE) AS pending_alumni,
        (SELECT COUNT(*) FROM mentorship_requests) AS mentorship_requests,
        (SELECT COUNT(*) FROM jobs) AS jobs,
        (SELECT COUNT(*) FROM events) AS events
    `);

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
