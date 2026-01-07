import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs");
        setJobs(res.data.jobs);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <p className="p-6">Loading jobs...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!jobs.length) return <p className="p-6 text-gray-500">No jobs available</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Job Openings</h1>

      <div className="space-y-3">
        {jobs.map(job => (
          <div key={job.id} className="border p-4 rounded bg-white shadow hover:shadow-lg">
            <h2 className="font-semibold">{job.title}</h2>
            <p className="text-sm">{job.company} • {job.location}</p>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{job.description}</p>

            <Link
              to={`/jobs/${job.id}/apply`}
              className="inline-block mt-2 text-blue-600 hover:underline"
            >
              Apply
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
