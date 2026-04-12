import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AcceptedMentorships() {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentorships = async () => {
      try {
        const res = await api.get("/mentorship/accepted");
        setMentorships(res.data.mentorships);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorships();
  }, []);

  if (loading) return <p className="p-6 text-gray-400">Loading...</p>;
  if (mentorships.length === 0)
    return <p className="p-6 text-gray-400">No accepted mentorships yet</p>;

  return (
    <div className="space-y-4 p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">Accepted Mentorships</h1>
        {mentorships.map((m) => (
        <div
            key={m.id}
            className="border border-green-900/50 rounded-lg p-5 bg-green-900/10 shadow-sm"
        >
            <span className="inline-block mb-3 px-2 py-1 bg-green-600/20 text-green-400 font-medium text-xs rounded uppercase tracking-wider">
            ACTIVE
            </span>
            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 font-medium text-xs rounded uppercase tracking-wider ml-2">
              VERIFIED
            </span>

            <p className="font-semibold text-white text-lg">{m.student_name}</p>
            <p className="text-sm text-gray-400">{m.student_email}</p>

            <p className="text-sm mt-3 text-green-500 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Active Mentorship
            </p>
        </div>
        ))}
    </div>
    );
}
