import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Applications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    api.get("/jobs/applications")
      .then(res => {
        setApplications(res.data.applications || []);
      })
      .catch(err => console.error(err));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/jobs/applications/${id}/status`, { status });
      setApplications(applications.map(app =>
        app.id === id ? { ...app, status } : app
      ));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Applications</h1>

      {applications.length === 0 && (
        <p>No applications found.</p>
      )}

      <div className="space-y-4">
        {applications.map(app => (
          <div key={app.id} className="border p-4 rounded">
            <p><b>Job:</b> {app.title}</p>
            <p><b>Applicant:</b> {app.student_name}</p>
            <p><b>Status:</b> {app.status}</p>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => updateStatus(app.id, "SHORTLISTED")}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Shortlist
              </button>
              <button
                onClick={() => updateStatus(app.id, "REJECTED")}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
