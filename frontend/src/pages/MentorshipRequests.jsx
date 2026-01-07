import { useEffect, useState } from "react";
import api from "../api/axios";

export default function MentorshipRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/mentorship/incoming");
      setRequests(res.data.requests);
    } catch (err) {
      console.error("Failed to fetch mentorship requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      setActionLoading(id);
      await api.post(`/mentorship/${id}/${action}`);
      await fetchRequests(); // keep UI in sync with backend
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (requests.length === 0)
    return <div className="text-center text-gray-500 py-10"> <p className="text-lg font-semibold">Nothing here yet</p> <p className="text-sm mt-1">New mentorship activity will appear here.</p></div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Mentorship Requests</h1>

      {requests.map((r) => (
        <div key={r.id} className="border p-4 mb-3 rounded">
          <p>
            <b>{r.student_name}</b> ({r.student_email})
          </p>

          {r.message && <p className="mt-1">{r.message}</p>}
          <p className="mt-1">Status: {r.status}</p>

          {r.status === "PENDING" && (
            <div className="flex gap-3 mt-3">
              <button
                disabled={actionLoading === r.id}
                onClick={() => handleAction(r.id, "accept")}
                className={`px-3 py-1 rounded text-white ${
                  actionLoading === r.id
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {actionLoading === r.id ? "Accepting..." : "Accept"}
              </button>

              <button
                disabled={actionLoading === r.id}
                onClick={() => handleAction(r.id, "reject")}
                className={`px-3 py-1 rounded text-white ${
                  actionLoading === r.id
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoading === r.id ? "Rejecting..." : "Reject"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
