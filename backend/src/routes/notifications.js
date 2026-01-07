import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Get my notifications
 */
router.get("/", requireAuth(), async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id=$1
     ORDER BY created_at DESC`,
    [req.user.id]
  );

  res.json({ notifications: result.rows });
});

/**
 * Mark as read
 */
router.patch("/:id/read", requireAuth(), async (req, res) => {
  const notificationId = req.params.id;

  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ notification: result.rows[0] });
  } catch (err) {
    console.error("MARK READ ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});


export default router;
