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

  if (loading) return <p className="p-6 text-gray-400">Loading...</p>;
  if (requests.length === 0)
    return <div className="text-center text-gray-400 py-10"> <p className="text-xl font-semibold text-gray-300">Nothing here yet</p> <p className="text-sm mt-2">New mentorship activity will appear here.</p></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">Mentorship Requests</h1>

      <div className="space-y-4">
        {requests.map((r) => (
          <div key={r.id} className="border border-gray-700 bg-gray-800 p-5 rounded-lg shadow-md">
            <p className="text-gray-300">
              <b className="text-white text-lg">{r.student_name}</b> <span className="text-gray-400">({r.student_email})</span>
            </p>

            {r.message && <p className="mt-3 text-gray-300 bg-gray-900/40 p-3 rounded">{r.message}</p>}
            <p className="mt-4 flex items-center gap-2">
                <span className="font-medium text-white">Status:</span> 
                <span className={`px-2 py-0.5 rounded text-xs font-semibold
                    ${r.status === 'PENDING' ? 'bg-yellow-900/50 text-yellow-500' : ''}
                    ${r.status === 'ACCEPTED' ? 'bg-green-900/50 text-green-400' : ''}
                    ${r.status === 'REJECTED' ? 'bg-red-900/50 text-red-400' : ''}
                `}>{r.status}</span>
            </p>

            {r.status === "PENDING" && (
              <div className="flex gap-3 mt-5">
                <button
                  disabled={actionLoading === r.id}
                  onClick={() => handleAction(r.id, "accept")}
                  className={`px-4 py-1.5 rounded-md text-white font-medium transition-colors text-sm ${
                    actionLoading === r.id
                      ? "bg-green-900/50 text-green-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {actionLoading === r.id ? "Accepting..." : "Accept"}
                </button>

                <button
                  disabled={actionLoading === r.id}
                  onClick={() => handleAction(r.id, "reject")}
                  className={`px-4 py-1.5 rounded-md text-white font-medium transition-colors text-sm ${
                    actionLoading === r.id
                      ? "bg-red-900/50 text-red-500 cursor-not-allowed"
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
    </div>
  );
}
