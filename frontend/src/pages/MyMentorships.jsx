import { useEffect, useState } from "react";
import api from "../api/axios";

export default function MyMentorships() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/mentorship/my-requests");
        setRequests(res.data.requests);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) return <p className="p-6 text-gray-400">Loading...</p>;
  if (requests.length === 0) return <div className="text-center text-gray-400 py-10"> <p className="text-xl font-semibold text-gray-300">Nothing here yet</p> <p className="text-sm mt-2">New mentorship activity will appear here.</p></div>;

  return (
    <div className="space-y-4 p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">My Mentorships</h1>
      {requests.map((r) => (
        <div key={r.id} className="border border-gray-700 bg-gray-800 p-5 rounded-lg shadow-md">
          <p className="font-semibold text-lg text-white">{r.alumni_name}</p>
          <p className="text-sm text-gray-400">{r.alumni_email}</p>

          <p className="mt-4 flex items-center gap-2 text-gray-300">
            <span className="font-medium text-white">Status:</span>
            <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    r.status === "ACCEPTED"
                    ? "bg-green-900/40 text-green-400"
                    : r.status === "REJECTED"
                    ? "bg-red-900/40 text-red-400"
                    : "bg-yellow-900/40 text-yellow-400"
                }`}
                >
                {r.status}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}
