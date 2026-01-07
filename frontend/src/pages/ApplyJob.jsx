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

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!job) return <p className="p-6">Loading job...</p>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">{job.title}</h1>
      <p className="mb-1"><strong>Company:</strong> {job.company}</p>
      <p className="mb-3">{job.description}</p>

      <input
        className="w-full border p-2 rounded mb-3"
        placeholder="Resume URL (optional)"
        value={resumeUrl}
        onChange={e => setResumeUrl(e.target.value)}
      />

      <button
        onClick={apply}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Applying..." : "Apply"}
      </button>
    </div>
  );
}
