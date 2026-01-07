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
    <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between">
      <Link to="/dashboard" className="font-bold">
        AlumnDEV
      </Link>

      <div className="flex gap-4 items-center">
        {user && (
          <Link to="/alumni">Alumni Directory</Link>
        )}

        {user?.role === "STUDENT" && (
          <>
            <Link to="/jobs">Jobs</Link>
            <NotificationLink />
          </>
        )}

        {user?.role === "ALUMNI" && (
          <>
            <Link to="/post-job">Post Job</Link>
            <Link to="/applications">Applications</Link>

            <Link to="/mentorship-requests">Mentorship</Link>

            <NotificationLink />
          </>
        )}

        {user?.role === "ADMIN" && (
          <Link to="/admin">Admin</Link>
        )}

        {user && (
          <button
            onClick={logout}
            className="bg-red-600 px-3 py-1 rounded"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
