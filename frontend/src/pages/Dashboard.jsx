import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "ALUMNI") {
      const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
          const res = await api.get("/alumni/analytics");
          setAnalytics(res.data.analytics);
        } catch (err) {
          console.error(err);
        } finally {
          setAnalyticsLoading(false);
        }
      };

      fetchAnalytics();
    }
  }, [user]);

  if (loading) return null;

  if (!user) {
    return <div className="p-6">Please login</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>

      {user.role === "STUDENT" && (
        <div className="space-y-3">
          <Link to="/jobs" className="block p-3 rounded border hover:bg-gray-50">
            Browse Jobs
          </Link>
          <Link to="/applications" className="block p-3 rounded border hover:bg-gray-50">
            My Applications
          </Link>
          <Link to="/my-mentorships" className="block p-3 rounded border hover:bg-gray-50">
            My Mentorship Requests
          </Link>
          <Link to="/notifications" className="block p-3 rounded border hover:bg-gray-50">
            Notifications
          </Link>
        </div>
      )}

      {user.role === "ALUMNI" && (
        <div className="space-y-3">
          <Link to="/post-job" className="block p-3 rounded border hover:bg-gray-50">
            Post Jobs
          </Link>
          <Link to="/applications" className="block p-3 rounded border hover:bg-gray-50">
            Applications
          </Link>
          <Link to="/mentorships/accepted" className="block p-3 rounded border hover:bg-gray-50">
            My Mentees
          </Link>
          <Link to="/notifications" className="block p-3 rounded border hover:bg-gray-50">
            Notifications
          </Link>

          {/* Alumni Analytics */}
          <div className="p-4 bg-white shadow rounded mt-4">
            <h2 className="text-xl font-bold mb-3">Profile Analytics</h2>
            {analyticsLoading && <p>Loading analytics...</p>}
            {!analyticsLoading && !analytics && <p>No analytics available</p>}
            {!analyticsLoading && analytics && (
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Profile Views:</span> {analytics.totalViews}
                </p>
                <p>
                  <span className="font-semibold">Pending Mentorship Requests:</span> {analytics.pendingRequests}
                </p>
                <p>
                  <span className="font-semibold">Accepted Requests:</span> {analytics.acceptedRequests}
                </p>
                <p>
                  <span className="font-semibold">Rejected Requests:</span> {analytics.rejectedRequests}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {user.role === "ADMIN" && (
        <div className="space-y-3">
          <Link to="/admin" className="block p-3 rounded border hover:bg-gray-50">
            Admin Panel
          </Link>
        </div>
      )}
    </div>
  );
}
