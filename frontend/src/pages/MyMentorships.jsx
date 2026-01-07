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

  if (loading) return <p>Loading...</p>;
  if (requests.length === 0) return <div className="text-center text-gray-500 py-10"> <p className="text-lg font-semibold">Nothing here yet</p> <p className="text-sm mt-1">New mentorship activity will appear here.</p></div>;

  return (
    <div className="space-y-4">
      {requests.map((r) => (
        <div key={r.id} className="border p-4 rounded">
          <p className="font-semibold">{r.alumni_name}</p>
          <p className="text-sm text-gray-600">{r.alumni_email}</p>

          <p className="mt-2">
            Status:{" "}
            <span
                className={`px-2 py-1 rounded text-sm font-semibold ${
                    r.status === "ACCEPTED"
                    ? "bg-green-100 text-green-700"
                    : r.status === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
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
