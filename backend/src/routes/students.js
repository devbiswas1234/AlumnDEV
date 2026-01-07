import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Create / Update Student Profile
router.post("/me", requireAuth("STUDENT"), async (req, res) => {
  const userId = req.user.id;
  const { department, current_year } = req.body || {};

  if (!department || !current_year)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    // Check if profile exists
    const existing = await pool.query(
      "SELECT * FROM student_profiles WHERE user_id=$1",
      [userId]
    );

    if (existing.rows.length > 0) {
      // Update
      const result = await pool.query(
        `UPDATE student_profiles
         SET department=$1, current_year=$2
         WHERE user_id=$3
         RETURNING *`,
        [department, current_year, userId]
      );
      return res.json({ profile: result.rows[0], message: "Profile updated" });
    }

    // Create
    const result = await pool.query(
      `INSERT INTO student_profiles (user_id, department, current_year)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [userId, department, current_year]
    );

    res.json({ profile: result.rows[0], message: "Profile created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get my profile
router.get("/me", requireAuth("STUDENT"), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM student_profiles WHERE user_id=$1",
      [req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Profile not found" });

    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
