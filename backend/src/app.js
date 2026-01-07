import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import alumniRoutes from "./routes/alumni.js";
import studentRoutes from "./routes/students.js";
import mentorshipRoutes from "./routes/mentorship.js";
import jobRoutes from "./routes/jobs.js";
import eventRoutes from "./routes/events.js";
import adminRoutes from "./routes/admin.js";
import notificationRoutes from "./routes/notifications.js";

// Routes
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);


app.get("/", (req, res) => {
  res.send("Alumni Platform Backend Running ✅");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
