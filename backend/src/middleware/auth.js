import jwt from "jsonwebtoken";

export const requireAuth = (role = null) => {
  return (req, res, next) => {
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

      // attach user safely
      req.user = {
        id: decoded.id,
        role: decoded.role
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
