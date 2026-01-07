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

  if (loading) return <p>Loading...</p>;
  if (mentorships.length === 0)
    return <p>No accepted mentorships yet</p>;

  return (
    <div className="space-y-4">
        {mentorships.map((m) => (
        <div
            key={m.id}
            className="border rounded p-4 bg-green-50 shadow-sm"
        >
            <span className="inline-block mb-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
            ACTIVE
            </span>

            <p className="font-semibold">{m.student_name}</p>
            <p className="text-sm text-gray-600">{m.student_email}</p>

            <p className="text-sm mt-2 text-green-700 font-semibold">
            Active Mentorship
            </p>
        </div>
        ))}
    </div>
    );
}
