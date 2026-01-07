import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Check if alumni is available for mentorship
 */
const checkAlumniAvailability = async (alumniId) => {
  const { rows } = await pool.query(
    `SELECT available_for_mentorship, max_mentees
     FROM alumni_profiles
     WHERE user_id = $1`,
    [alumniId]
  );
  if (!rows.length) return null;
  return rows[0];
};

/**
 * CREATE mentorship request (STUDENT only)
 * Handles PENDING / QUEUED depending on max_mentees
 */
router.post("/request/:alumniId", requireAuth("STUDENT"), async (req, res) => {
  const studentId = req.user.id;
  const alumniId = req.params.alumniId;

  try {
    const profile = await checkAlumniAvailability(alumniId);

    if (!profile || !profile.available_for_mentorship) {
      return res.status(400).json({ message: "Alumni not available for mentorship" });
    }

    // Check if request already exists
    const { rows: existing } = await pool.query(
      `SELECT 1 FROM mentorship_requests WHERE student_id=$1 AND alumni_id=$2`,
      [studentId, alumniId]
    );
    if (existing.length) {
      return res.status(400).json({ message: "You have already sent a request to this alumni" });
    }

    // Count currently accepted mentees
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) AS accepted_count
       FROM mentorship_requests
       WHERE alumni_id=$1 AND status='ACCEPTED'`,
      [alumniId]
    );
    const acceptedCount = parseInt(countRows[0].accepted_count, 10);

    let status = "PENDING";
    let queuePosition = null;

    if (acceptedCount >= profile.max_mentees) {
      status = "QUEUED";
      // Assign queue position
      const { rows: queueRows } = await pool.query(
        `SELECT COALESCE(MAX(queue_position), 0)+1 AS position
         FROM mentorship_requests
         WHERE alumni_id=$1 AND status='QUEUED'`,
        [alumniId]
      );
      queuePosition = queueRows[0].position;
    }

    const { rows: requestRows } = await pool.query(
      `INSERT INTO mentorship_requests
        (student_id, alumni_id, status, queue_position, created_at)
       VALUES ($1,$2,$3,$4,NOW())
       RETURNING *`,
      [studentId, alumniId, status, queuePosition]
    );

    // 🔔 Notify student
    await pool.query(
      `INSERT INTO notifications (user_id, type, message)
       VALUES ($1, 'MENTORSHIP_${status}', $2)`,
      [
        studentId,
        status === "QUEUED"
          ? "Mentor is full, you are added to the queue"
          : "Your mentorship request has been sent",
      ]
    );

    res.json({ request: requestRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create mentorship request" });
  }
});

/**
 * GET incoming mentorship requests (ALUMNI only, PENDING)
 */
router.get("/incoming", requireAuth("ALUMNI"), async (req, res) => {
  try {
    const alumniId = req.user.id;

    const { rows } = await pool.query(
      `SELECT m.id, m.status, m.created_at,
              u.name AS student_name, u.email AS student_email
       FROM mentorship_requests m
       JOIN users u ON u.id = m.student_id
       WHERE m.alumni_id=$1 AND m.status='PENDING'
       ORDER BY m.created_at DESC`,
      [alumniId]
    );

    res.json({ requests: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

/**
 * ACCEPT mentorship (ALUMNI only)
 * Moves queued requests to pending if spot opens
 */
router.post("/:id/accept", requireAuth("ALUMNI"), async (req, res) => {
  const alumniId = req.user.id;
  const requestId = req.params.id;

  try {
    const { rows: resultRows } = await pool.query(
      `UPDATE mentorship_requests
       SET status='ACCEPTED', queue_position=NULL
       WHERE id=$1 AND alumni_id=$2 AND status='PENDING'
       RETURNING student_id`,
      [requestId, alumniId]
    );
    if (!resultRows.length) return res.status(404).json({ message: "Request not found" });

    const studentId = resultRows[0].student_id;

    // Notify student
    await pool.query(
      `INSERT INTO notifications (user_id, type, message)
       VALUES ($1,'MENTORSHIP_ACCEPTED','Your mentorship request has been accepted')`,
      [studentId]
    );

    // Move first queued request (if any) to pending
    const { rows: queuedRows } = await pool.query(
      `SELECT id, student_id FROM mentorship_requests
       WHERE alumni_id=$1 AND status='QUEUED'
       ORDER BY queue_position ASC
       LIMIT 1`,
      [alumniId]
    );

    if (queuedRows.length) {
      const nextQueued = queuedRows[0];
      await pool.query(
        `UPDATE mentorship_requests SET status='PENDING', queue_position=NULL WHERE id=$1`,
        [nextQueued.id]
      );
      await pool.query(
        `INSERT INTO notifications (user_id, type, message)
         VALUES ($1,'MENTORSHIP_PENDING','A spot opened up, your request is now pending')`,
        [nextQueued.student_id]
      );
    }

    res.json({ message: "Mentorship accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Accept failed" });
  }
});

/**
 * REJECT mentorship (ALUMNI only)
 */
router.post("/:id/reject", requireAuth("ALUMNI"), async (req, res) => {
  const alumniId = req.user.id;
  const requestId = req.params.id;

  try {
    const { rows: resultRows } = await pool.query(
      `UPDATE mentorship_requests
       SET status='REJECTED', queue_position=NULL
       WHERE id=$1 AND alumni_id=$2 AND status='PENDING'
       RETURNING student_id`,
      [requestId, alumniId]
    );
    if (!resultRows.length) return res.status(404).json({ message: "Request not found" });

    const studentId = resultRows[0].student_id;

    await pool.query(
      `INSERT INTO notifications (user_id, type, message)
       VALUES ($1,'MENTORSHIP_REJECTED','Your mentorship request has been rejected')`,
      [studentId]
    );

    res.json({ message: "Mentorship rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reject failed" });
  }
});

/**
 * GET current student's mentorship requests (STUDENT only)
 */
router.get("/my-requests", requireAuth("STUDENT"), async (req, res) => {
  try {
    const studentId = req.user.id;

    const { rows } = await pool.query(
      `SELECT m.id, m.status, m.created_at,
              u.name AS alumni_name, u.email AS alumni_email
       FROM mentorship_requests m
       JOIN users u ON u.id = m.alumni_id
       WHERE m.student_id=$1
       ORDER BY m.created_at DESC`,
      [studentId]
    );

    res.json({ requests: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch mentorship status" });
  }
});

/**
 * GET accepted mentorships (ALUMNI only)
 */
router.get("/accepted", requireAuth("ALUMNI"), async (req, res) => {
  try {
    const alumniId = req.user.id;

    const { rows } = await pool.query(
      `SELECT m.id, m.created_at,
              u.name AS student_name, u.email AS student_email
       FROM mentorship_requests m
       JOIN users u ON u.id = m.student_id
       WHERE m.alumni_id=$1 AND m.status='ACCEPTED'
       ORDER BY m.created_at DESC`,
      [alumniId]
    );

    res.json({ mentorships: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch accepted mentorships" });
  }
});

export default router;
