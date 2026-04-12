import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
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

  // ✅ ADMIN → redirect to admin dashboard
  if (user.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-200">
      <h1 className="text-3xl font-bold mb-8 text-white">
        Welcome, {user.name}
      </h1>

      {/* STUDENT */}
      {user.role === "STUDENT" && (
        <div className="space-y-4">
          <Link to="/jobs" className="block p-5 rounded-xl border border-gray-700/50 bg-[#0f1422]/80 hover:bg-[#151b2b] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 backdrop-blur-sm">
            <span className="font-semibold text-white">Browse Jobs</span>
            <p className="text-sm text-gray-400 mt-1">Discover new career opportunities tailored for you.</p>
          </Link>
          <Link to="/applications" className="block p-5 rounded-xl border border-gray-700/50 bg-[#0f1422]/80 hover:bg-[#151b2b] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 backdrop-blur-sm">
            <span className="font-semibold text-white">My Applications</span>
            <p className="text-sm text-gray-400 mt-1">Track the status of your submitted job applications.</p>
          </Link>
          <Link to="/my-mentorships" className="block p-5 rounded-xl border border-gray-700/50 bg-[#0f1422]/80 hover:bg-[#151b2b] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 backdrop-blur-sm">
            <span className="font-semibold text-white">My Mentorship Requests</span>
            <p className="text-sm text-gray-400 mt-1">View your current mentorship connections and requests.</p>
          </Link>
          <Link to="/notifications" className="block p-5 rounded-xl border border-gray-700/50 bg-[#0f1422]/80 hover:bg-[#151b2b] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 backdrop-blur-sm">
            <span className="font-semibold text-white">Notifications</span>
            <p className="text-sm text-gray-400 mt-1">Check your recent alerts and updates.</p>
          </Link>
        </div>
      )}

      {/* ALUMNI */}
      {user.role === "ALUMNI" && (
        <div className="space-y-6">

          {/* ⭐ Edit Profile Card */}
          <div className="p-6 bg-gradient-to-br from-blue-900/40 to-indigo-900/20 border border-blue-500/30 rounded-2xl shadow-lg shadow-blue-900/10 backdrop-blur-md relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
            <h2 className="text-2xl font-bold mb-2 text-white">
              Your Alumni Profile
            </h2>
            <p className="text-sm text-blue-200/80 mb-6">
              Keep your profile updated to unlock exclusive networking and mentorship opportunities.
            </p>
            <Link
              to={`/alumni/${user.id}`}
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-blue-500/25 border border-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 font-semibold"
            >
              Edit Profile
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/post-job" className="flex items-center p-5 rounded-xl border border-gray-700/50 bg-[#0f1422]/80 hover:bg-[#151b2b] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 font-medium text-gray-200 hover:text-white">
              Post Opportunities
            </Link>
            <Link to="/applications" className="flex items-center p-5 rounded-xl border border-gray-700/50 bg-[#0f1422]/80 hover:bg-[#151b2b] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 font-medium text-gray-200 hover:text-white">
              Review Applications
            </Link>
            <Link to="/mentorships/accepted" className="flex items-center p-5 rounded-xl border border-gray-700/50 bg-[#0f1422]/80 hover:bg-[#151b2b] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 font-medium text-gray-200 hover:text-white">
              My Mentees
            </Link>
            <Link to="/notifications" className="flex items-center p-5 rounded-xl border border-gray-700/50 bg-[#0f1422]/80 hover:bg-[#151b2b] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 font-medium text-gray-200 hover:text-white">
              Latest Notifications
            </Link>
          </div>

          {/* 📊 Alumni Analytics */}
          <div className="p-8 bg-[#0f1422]/60 border border-gray-800 shadow-xl rounded-2xl mt-6 backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              Profile Analytics
              <span className="text-xs font-normal bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20">Live</span>
            </h2>

            {analyticsLoading && <div className="animate-pulse flex space-x-4"><div className="h-10 bg-gray-800/50 rounded w-full"></div></div>}
            {!analyticsLoading && !analytics && <p className="text-gray-500">No analytics data available yet.</p>}

            {!analyticsLoading && analytics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#151b2b]/80 p-5 rounded-xl border border-gray-800 shadow-inner group hover:border-gray-700 transition-colors">
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Profile Views</p>
                  <p className="text-3xl font-extrabold text-white group-hover:text-blue-400 transition-colors">{analytics.totalViews}</p>
                </div>
                <div className="bg-[#151b2b]/80 p-5 rounded-xl border border-gray-800 shadow-inner group hover:border-yellow-900/30 transition-colors">
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Pending</p>
                  <p className="text-3xl font-extrabold text-yellow-400">{analytics.pendingRequests}</p>
                </div>
                <div className="bg-[#151b2b]/80 p-5 rounded-xl border border-gray-800 shadow-inner group hover:border-green-900/30 transition-colors">
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Accepted</p>
                  <p className="text-3xl font-extrabold text-green-400">{analytics.acceptedRequests}</p>
                </div>
                <div className="bg-[#151b2b]/80 p-5 rounded-xl border border-gray-800 shadow-inner group hover:border-red-900/30 transition-colors">
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Rejected</p>
                  <p className="text-3xl font-extrabold text-red-500">{analytics.rejectedRequests}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
