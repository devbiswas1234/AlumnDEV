import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Alumni create a job post
 */
router.post("/", requireAuth("ALUMNI"), async (req, res) => {
  const postedBy = req.user.id;
  const { title, company, description, location } = req.body || {};

  if (!title || !company) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO jobs (posted_by, title, company, description, location)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [postedBy, title, company, description, location]
    );

    res.json({ job: result.rows[0], message: "Job posted" });
  } catch (err) {
    console.error("JOB CREATE ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * Students view all jobs
 */
router.get("/", requireAuth("STUDENT"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, u.name AS alumni_name
       FROM jobs j
       JOIN users u ON j.posted_by = u.id
       ORDER BY j.created_at DESC`
    );

    res.json({ jobs: result.rows });
  } catch (err) {
    console.error("FETCH JOBS ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * Student applies for a job
 */
router.post("/:id/apply", requireAuth("STUDENT"), async (req, res) => {
  const jobId = req.params.id;
  const studentId = req.user.id;
  const { resume_url } = req.body || {};

  try {
    // 1️⃣ Check job exists
    const jobInfo = await pool.query(
      `SELECT posted_by, title FROM jobs WHERE id=$1`,
      [jobId]
    );

    if (!jobInfo.rows.length) {
      return res.status(404).json({ error: "Job not found" });
    }

    const jobOwnerId = jobInfo.rows[0].posted_by;
    const jobTitle = jobInfo.rows[0].title;

    // 2️⃣ Prevent duplicate application
    const existing = await pool.query(
      `SELECT 1 FROM applications WHERE job_id=$1 AND student_id=$2`,
      [jobId, studentId]
    );

    if (existing.rows.length) {
      return res.status(400).json({ error: "Already applied" });
    }

    // 3️⃣ Insert application
    const result = await pool.query(
      `INSERT INTO applications (job_id, student_id, resume_url)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [jobId, studentId, resume_url || null]
    );

    // 4️⃣ Notify alumni
    await pool.query(
      `INSERT INTO notifications (user_id, message, type)
       VALUES ($1,$2,$3)`,
      [
        jobOwnerId,
        `New application received for "${jobTitle}"`,
        "JOB_APPLICATION"
      ]
    );

    res.json({
      application: result.rows[0],
      message: "Applied successfully"
    });

  } catch (err) {
    console.error("APPLY JOB ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * Alumni view applications for their jobs
 */
router.get("/applications", requireAuth("ALUMNI"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        a.id,
        a.status,
        a.applied_at,
        u.name AS student_name,
        u.email,
        j.title,
        j.company
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON a.student_id = u.id
       WHERE j.posted_by = $1
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );

    res.json({ applications: result.rows });
  } catch (err) {
    console.error("VIEW APPLICATIONS ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * Alumni update application status
 */
router.patch("/applications/:id/status", requireAuth("ALUMNI"), async (req, res) => {
  const { status } = req.body || {};
  const applicationId = req.params.id;

  if (!["SHORTLISTED", "REJECTED"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const result = await pool.query(
      `UPDATE applications a
       SET status = $1
       FROM jobs j
       WHERE a.id = $2
         AND a.job_id = j.id
         AND j.posted_by = $3
       RETURNING a.*, j.title`,
      [status, applicationId, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Notify student
    await pool.query(
      `INSERT INTO notifications (user_id, message, type)
       VALUES ($1,$2,$3)`,
      [
        result.rows[0].student_id,
        `Your application for "${result.rows[0].title}" was ${status}`,
        "APPLICATION_STATUS"
      ]
    );

    res.json({ application: result.rows[0], message: "Status updated" });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
