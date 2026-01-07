import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Create Event (ALUMNI / ADMIN)
 */
router.post("/", requireAuth(), async (req, res) => {
  const { title, description, event_date, location } = req.body || {};
  const createdBy = req.user.id;

  if (!title || !event_date)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const result = await pool.query(
      `INSERT INTO events (created_by, title, description, event_date, location)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [createdBy, title, description, event_date, location]
    );

    res.json({ event: result.rows[0], message: "Event created" });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * View all events
 */
router.get("/", requireAuth(), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.name AS creator_name
       FROM events e
       JOIN users u ON e.created_by = u.id
       ORDER BY e.event_date ASC`
    );

    res.json({ events: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Register for event
 */
router.post("/:id/register", requireAuth(), async (req, res) => {
  try {
    const result = await pool.query(
      `INSERT INTO event_registrations (event_id, user_id)
       VALUES ($1,$2)
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    res.json({ registration: result.rows[0], message: "Registered successfully" });
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ error: "Already registered" });

    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * View event registrations (creator only)
 */
router.get("/:id/registrations", requireAuth(), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email
       FROM event_registrations er
       JOIN users u ON er.user_id = u.id
       JOIN events e ON er.event_id = e.id
       WHERE er.event_id=$1 AND e.created_by=$2`,
      [req.params.id, req.user.id]
    );

    res.json({ attendees: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
