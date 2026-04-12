import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await api.get("/admin/stats");
        setStats(statsRes.data);

        const alumniRes = await api.get("/admin/alumni/pending");
        setPendingAlumni(alumniRes.data.alumni);
      } catch (err) {
        console.error("Admin dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const approve = async (userId) => {
    try {
      await api.patch(`/admin/alumni/${userId}/verify`);
      setPendingAlumni((prev) =>
        prev.filter((a) => a.user_id !== userId)
      );
    } catch {
      alert("Approval failed");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!stats) return <p>Failed to load stats</p>;

  const Card = ({ title, value }) => (
    <div className="bg-[#0f1422]/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider relative z-10 mb-2">{title}</p>
      <p className="text-4xl font-extrabold text-white relative z-10 group-hover:text-cyan-400 transition-colors drop-shadow-md">{value}</p>
    </div>
  );

  return (
    <div className="space-y-10 text-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Platform Overview</h1>
          <p className="text-gray-400 mt-1">High-level metrics and urgent actions.</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Users" value={stats.total_users} />
        <Card title="Alumni" value={stats.alumni} />
        <Card title="Students" value={stats.students} />
        <Card title="Pending Alumni" value={stats.pending_alumni} />
      </div>

      {/* PENDING ALUMNI */}
      <div className="bg-[#0f1422]/40 backdrop-blur-sm p-6 lg:p-8 rounded-2xl border border-gray-800/80 shadow-2xl relative overflow-hidden">
        {/* Glow behind the list */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
          Pending Approvals
          {pendingAlumni.length > 0 && (
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-yellow-500/20">
              {pendingAlumni.length} Needs Action
            </span>
          )}
        </h2>

        {pendingAlumni.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-900/30 rounded-xl border border-gray-800/50">
            <svg className="w-12 h-12 mx-auto opacity-40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="font-semibold">All caught up!</p>
            <p className="text-sm">No pending alumni await your approval.</p>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            {pendingAlumni.map((a) => (
              <div
                key={a.user_id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800/60 p-5 rounded-xl border border-gray-700/60 shadow-lg hover:border-gray-600 transition-colors group"
              >
                <div className="mb-4 sm:mb-0">
                  <p className="font-bold text-white text-lg flex items-center gap-2">
                    {a.name}
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-gray-900 border border-gray-700 px-2 py-0.5 rounded">Alumni</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span>{a.email}</span>
                    <span className="opacity-50">•</span>
                    <span>{a.department}</span>
                    <span className="opacity-50">•</span>
                    <span className="text-gray-300">Class of {a.passing_year}</span>
                  </p>
                </div>

                <button
                  onClick={() => approve(a.user_id)}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2 rounded-lg shadow-lg shadow-green-600/20 border border-green-500 transition-all hover:-translate-y-0.5"
                >
                  Approve User
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
