import { Link } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    api.get("/notifications")
      .then(res => {
        const unread = res.data.notifications?.filter(n => !n.is_read) || [];
        setUnreadCount(unread.length);
      })
      .catch(() => {});
  }, [user]);

  const NotificationLink = () => (
    <Link to="/notifications" className="relative">
      Notifications
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-2 rounded-full">
          {unreadCount}
        </span>
      )}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-[#0f1422]/70 backdrop-blur-md text-white px-6 py-4 flex justify-between items-center border-b border-gray-800/50 shadow-sm">
      <Link to="/dashboard" className="font-extrabold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 hover:opacity-80 transition-opacity">
        AlumnDEV
      </Link>

      <div className="flex gap-6 items-center font-medium">
        {user && (
          <Link to="/alumni" className="hover:text-blue-400 transition-colors">Alumni Directory</Link>
        )}

        {user?.role === "STUDENT" && (
          <>
            <Link to="/jobs" className="hover:text-blue-400 transition-colors">Jobs</Link>
            <div className="hover:text-blue-400 transition-colors">
              <NotificationLink />
            </div>
          </>
        )}

        {user?.role === "ALUMNI" && (
          <>
            <Link to="/post-job" className="hover:text-blue-400 transition-colors">Post Job</Link>
            <Link to="/applications" className="hover:text-blue-400 transition-colors">Applications</Link>

            <Link to="/mentorship-requests" className="hover:text-blue-400 transition-colors">Mentorship</Link>

            <div className="hover:text-blue-400 transition-colors">
              <NotificationLink />
            </div>
          </>
        )}

        {user?.role === "ADMIN" && (
          <>
            <Link to="/admin" className="hover:text-blue-400 transition-colors">Admin</Link>
            <Link to="/analytics" className="hover:text-blue-400 transition-colors">Analytics</Link>
          </>
        )}

        {user && (
          <button
            onClick={logout}
            className="bg-red-600/90 hover:bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-lg shadow-red-600/20 ml-3 border border-red-500/30 hover:-translate-y-0.5"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
