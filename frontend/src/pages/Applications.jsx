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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">Applications</h1>

      {applications.length === 0 && (
        <p className="text-gray-400">No applications found.</p>
      )}

      <div className="space-y-4">
        {applications.map(app => (
          <div key={app.id} className="border border-gray-700 p-5 rounded-lg bg-gray-800 shadow-md">
            <p className="text-gray-300"><b className="text-white">Job:</b> {app.title}</p>
            <p className="text-gray-300"><b className="text-white">Applicant:</b> {app.student_name}</p>
            <p className="text-gray-300"><b className="text-white">Status:</b> 
              <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold
                ${app.status === 'APPLIED' ? 'bg-yellow-900/50 text-yellow-500' : ''}
                ${app.status === 'SHORTLISTED' ? 'bg-green-900/50 text-green-400' : ''}
                ${app.status === 'REJECTED' ? 'bg-red-900/50 text-red-400' : ''}
              `}>
                {app.status}
              </span>
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => updateStatus(app.id, "SHORTLISTED")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded transition-colors text-sm font-medium"
              >
                Shortlist
              </button>
              <button
                onClick={() => updateStatus(app.id, "REJECTED")}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded transition-colors text-sm font-medium"
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
