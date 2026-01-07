import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AlumniDirectory from "./pages/AlumniDirectory.jsx";
import Admin from "./pages/Admin.jsx";
import Jobs from "./pages/Jobs.jsx";
import ApplyJob from "./pages/ApplyJob.jsx";
import Applications from "./pages/Applications.jsx";
import Notifications from "./pages/Notifications.jsx";
import PostJob from "./pages/PostJob.jsx";
import AlumniProfile from "./pages/AlumniProfile.jsx";
import MentorshipRequests from "./pages/MentorshipRequests";
import MyMentorships from "./pages/MyMentorships";
import AcceptedMentorships from "./pages/AcceptedMentorships";

import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Any logged-in user */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Alumni directory – ALL logged-in users */}
        <Route
          path="/alumni"
          element={
            <ProtectedRoute>
              <AlumniDirectory />
            </ProtectedRoute>
          }
        />

        {/* Alumni profile – ALL logged-in users */}
        <Route
          path="/alumni/:id"
          element={
            <ProtectedRoute>
              <AlumniProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentorship-requests"
          element={
            <ProtectedRoute role="ALUMNI">
              <MentorshipRequests />
            </ProtectedRoute>
          }
        />

        {/* Alumni only */}
        <Route
          path="/applications"
          element={
            <ProtectedRoute role="ALUMNI">
              <Applications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentorships/accepted"
          element={<AcceptedMentorships />}
        />
        <Route
          path="/post-job"
          element={
            <ProtectedRoute role="ALUMNI">
              <PostJob />
            </ProtectedRoute>
          }
        />

        {/* Admin only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Student only */}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute role="STUDENT">
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route path="/my-mentorships" element={<MyMentorships />} />

        <Route
          path="/jobs/:id/apply"
          element={
            <ProtectedRoute role="STUDENT">
              <ApplyJob />
            </ProtectedRoute>
          }
        />

        {/* Shared */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
