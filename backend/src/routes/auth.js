import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password, role, batch, degree, location } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
       (name, email, password_hash, role, batch, degree, location)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, name, email, role, batch, degree, location`,
      [name, email, hashed, role, batch, degree, location]
    );

    const token = jwt.sign(
      { id: result.rows[0].id, role: result.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ user: result.rows[0], token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
    if (user.rows.length === 0) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!match) return res.status(400).json({ error: "Incorrect password" });

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ user: { id: user.rows[0].id, name: user.rows[0].name, role: user.rows[0].role }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get current logged-in user
router.get("/me", requireAuth(), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, batch, degree, location
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
