import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminVerifyAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUnverified = async () => {
    try {
      const res = await api.get("/admin/unverified-alumni");
      setAlumni(res.data.alumni || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnverified();
  }, []);

  const verifyAlumni = async (id) => {
    if (!confirm("Verify this alumni?")) return;

    try {
      await api.patch(`/admin/verify/${id}`);
      setAlumni(alumni.filter((a) => a.user_id !== id));
    } catch (err) {
      alert("Verification failed");
    }
  };

  if (loading) return <p className="p-6 text-gray-400">Loading...</p>;

  return (
    <div className="text-gray-200 mt-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Unverified Alumni</h1>
          <p className="text-gray-400 mt-1">Review accounts awaiting official verification status.</p>
        </div>
      </div>

      {alumni.length === 0 && (
        <div className="py-16 text-center text-gray-500 bg-[#0f1422]/40 backdrop-blur-sm rounded-2xl border border-gray-800/80 shadow-inner">
          <svg className="w-16 h-16 mx-auto opacity-30 mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
          <p className="text-xl font-bold text-gray-300 mb-1">All verified! 🎉</p>
          <p>No alumni accounts are currently unverified.</p>
        </div>
      )}

      <div className="space-y-4">
        {alumni.map((a) => (
          <div
            key={a.user_id}
            className="group flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0f1422]/60 backdrop-blur-md p-5 rounded-xl border border-gray-800 shadow-lg hover:border-gray-700 hover:-translate-y-0.5 hover:shadow-green-500/10 transition-all duration-300"
          >
            <div className="mb-4 md:mb-0">
              <p className="font-bold text-white text-lg flex items-center gap-2">
                {a.name}
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded ml-2">Unverified</span>
              </p>
              
              <div className="mt-2 flex items-center gap-3 text-sm text-gray-400 flex-wrap">
                <span className="bg-gray-800/80 px-2.5 py-1 rounded border border-gray-700/50 flex items-center gap-1.5">
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  {a.department} • {a.passing_year}
                </span>
                
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  {a.email}
                </span>
              </div>
            </div>

            <button
              onClick={() => verifyAlumni(a.user_id)}
              className="w-full md:w-auto bg-green-600 hover:bg-green-500 shadow-md shadow-green-600/20 text-white px-5 py-2 rounded-lg font-semibold border border-green-500 transition-all hover:-translate-y-0.5 shrink-0"
            >
              Verify Alumni Status
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
