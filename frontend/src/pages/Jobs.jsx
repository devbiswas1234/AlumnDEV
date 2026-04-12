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

  if (loading) return <p className="p-6 text-gray-400">Loading jobs...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!jobs.length) return <p className="p-6 text-gray-400">No jobs available</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Job Openings</h1>
          <p className="text-gray-400 mt-2">Discover the latest opportunities posted by our alumni network.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(job => (
          <div key={job.id} className="group border border-gray-800 bg-[#0f1422]/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-900/50 to-blue-900/50 border border-blue-800/30 flex items-center justify-center text-xl font-bold text-blue-400 shrink-0">
                  {job.company?.charAt(0).toUpperCase() || "C"}
                </div>
              </div>

              <h2 className="font-bold text-2xl text-white leading-tight mb-2">{job.title}</h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs font-semibold text-gray-300 bg-gray-800/80 px-2.5 py-1 rounded-md border border-gray-700/50 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  {job.company}
                </span>
                <span className="text-xs font-semibold text-gray-300 bg-gray-800/80 px-2.5 py-1 rounded-md border border-gray-700/50 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {job.location}
                </span>
              </div>

              <div className="w-full h-px bg-gray-800/80 my-4"></div>

              <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                {job.description}
              </p>
            </div>

            <div className="mt-6 pt-4">
              <Link
                to={`/jobs/${job.id}/apply`}
                className="block text-center w-full bg-gray-800 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg shadow-blue-500/20 border border-gray-700 group-hover:border-blue-500/50 transition-all duration-300"
              >
                View & Apply
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
