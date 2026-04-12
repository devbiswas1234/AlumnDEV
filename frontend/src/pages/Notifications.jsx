import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      await fetchNotifications(); // keep backend as source of truth
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) return <p className="p-6 text-gray-400">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">Notifications</h1>

      {notifications.length === 0 && <p className="text-gray-400">No notifications yet</p>}

      <div className="space-y-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-5 rounded-lg border shadow-sm flex justify-between items-center transition-colors ${
              n.is_read ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-blue-900/30 border-blue-800 text-white"
            }`}
          >
            <p className={`font-medium ${n.is_read ? 'text-gray-400' : 'text-blue-50'}`}>{n.message}</p>

            {!n.is_read && (
              <button
                onClick={() => markAsRead(n.id)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors ml-4 whitespace-nowrap"
              >
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
