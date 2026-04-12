import jwt from "jsonwebtoken";
import { pool } from "../db.js";

/**
 * Require authentication (optionally role-based)
 */
export const requireAuth = (role = null) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.id || !decoded.role) {
        return res.status(401).json({ error: "Invalid token payload" });
      }

      // 🔍 Fetch user status from DB
      const { rows } = await pool.query(
        `
        SELECT id, role, is_active
        FROM users
        WHERE id = $1
        `,
        [decoded.id]
      );

      if (!rows.length) {
        return res.status(401).json({ error: "User not found" });
      }

      const user = rows[0];

      // 🚫 Account disabled check (WHAT YOU ASKED FOR)
      if (!user.is_active) {
        return res.status(403).json({
          message: "Account disabled"
        });
      }

      // attach user
      req.user = {
        id: user.id,
        role: user.role
      };

      // role check (if required)
      if (role && req.user.role !== role) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    } catch (err) {
      console.error("AUTH ERROR:", err.message);
      return res.status(401).json({ error: "Authentication failed" });
    }
  };
};

/**
 * Require ADMIN role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};
