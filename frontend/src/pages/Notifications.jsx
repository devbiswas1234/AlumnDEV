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

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      {notifications.length === 0 && <p>No notifications yet</p>}

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 border rounded flex justify-between items-center ${
              n.is_read ? "bg-gray-50" : "bg-blue-50"
            }`}
          >
            <p className="font-medium">{n.message}</p>

            {!n.is_read && (
              <button
                onClick={() => markAsRead(n.id)}
                className="text-sm text-blue-600"
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
