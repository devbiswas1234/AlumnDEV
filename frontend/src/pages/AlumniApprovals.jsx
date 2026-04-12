import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AlumniApprovals() {
  const [alumni, setAlumni] = useState([]);

  const fetchPending = () => {
    api.get("/admin/pending-alumni")
      .then(res => setAlumni(res.data.alumni));
  };

  useEffect(fetchPending, []);

  const approve = async (id) => {
    await api.post(`/admin/alumni/${id}/approve`);
    fetchPending();
  };

  const remove = async (id) => {
    await api.delete(`/admin/user/${id}`);
    fetchPending();
  };

  return (
    <div className="text-gray-200 mt-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Pending Registrations</h1>
          <p className="text-gray-400 mt-1">Review new alumni sign-up requests.</p>
        </div>
      </div>

      {alumni.length === 0 && (
        <div className="py-16 text-center text-gray-500 bg-[#0f1422]/40 backdrop-blur-sm rounded-2xl border border-gray-800/80 shadow-inner">
          <svg className="w-16 h-16 mx-auto opacity-30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p className="text-xl font-bold text-gray-300 mb-1">Queue Empty</p>
          <p>No new registration requests waiting for your approval.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {alumni.map(a => (
          <div key={a.id} className="bg-[#0f1422]/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl hover:-translate-y-1 hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-xl text-white truncate">{a.name}</p>
                <span className="text-[10px] uppercase font-bold tracking-wider text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">Pending</span>
              </div>
              <p className="text-sm text-gray-400 mb-4 flex items-center gap-2 bg-gray-900/50 p-2 rounded-lg border border-gray-800/50">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                {a.email}
              </p>
            </div>

            <div className="mt-6 flex gap-3 border-t border-gray-800/80 pt-5">
              <button
                onClick={() => approve(a.id)}
                className="flex-1 bg-green-600 hover:bg-green-500 shadow-lg shadow-green-600/20 border border-green-500 text-white transition-all py-2 rounded-lg text-sm font-semibold hover:-translate-y-0.5"
              >
                Approve
              </button>

              <button
                onClick={() => remove(a.id)}
                className="flex-1 bg-gray-800 hover:bg-red-600 shadow-lg hover:shadow-red-600/20 border border-gray-700 hover:border-red-500 text-gray-300 hover:text-white transition-all py-2 rounded-lg text-sm font-semibold"
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
