import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getOverview,
  getGraduationYears,
  getIndustries,
  getCompanies,
  getLocations
} from "../controllers/analyticsController.js";

const router = express.Router();

// Custom middleware to check roles for Analytics access
const requireAnalyticsAccess = (req, res, next) => {
  const allowedRoles = ["ADMIN", "STAFF", "COORDINATOR"];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Analytics access denied. Insufficient permissions." });
  }
  next();
};

// Protect all analytics routes
router.use(requireAuth());
router.use(requireAnalyticsAccess);

router.get("/overview", getOverview);
router.get("/graduation-years", getGraduationYears);
router.get("/industries", getIndustries);
router.get("/companies", getCompanies);
router.get("/locations", getLocations);

export default router;
