import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";

export default function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resumeUrl, setResumeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get("/jobs");
        const found = res.data.jobs.find(j => j.id === parseInt(id));
        if (!found) setError("Job not found");
        else setJob(found);
      } catch (err) {
        console.error(err);
        setError("Failed to load job");
      }
    };
    fetchJob();
  }, [id]);

  const apply = async () => {
    if (!job) return;
    setLoading(true);
    setError("");
    try {
      await api.post(`/jobs/${id}/apply`, { resume_url: resumeUrl });
      alert("Application submitted successfully!");
      navigate("/jobs");
    } catch (e) {
      setError(e.response?.data?.error || "Failed to apply");
    } finally {
      setLoading(false);
    }
  };

  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!job) return <p className="p-6 text-gray-400">Loading job...</p>;

  return (
    <div className="p-8 max-w-md mx-auto bg-gray-800 border border-gray-700 shadow-xl rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-4 text-white">{job.title}</h1>
      <p className="mb-2 text-gray-300"><strong className="text-white">Company:</strong> {job.company}</p>
      <p className="mb-6 text-gray-400">{job.description}</p>

      <input
        className="input mb-4"
        placeholder="Resume URL (optional)"
        value={resumeUrl}
        onChange={e => setResumeUrl(e.target.value)}
      />

      <button
        onClick={apply}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2.5 rounded-md w-full font-medium mt-2 disabled:opacity-50"
      >
        {loading ? "Applying..." : "Apply"}
      </button>
    </div>
  );
}
