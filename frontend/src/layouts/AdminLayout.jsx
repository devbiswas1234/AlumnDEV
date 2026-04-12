import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-76px)]">
      {/* Premium Glassmorphism Sidebar */}
      <aside className="w-64 bg-[#0f1422]/70 backdrop-blur-md border-r border-gray-800/80 p-6 flex flex-col shadow-2xl relative z-10">
        <h2 className="text-sm font-extrabold tracking-widest text-gray-400 uppercase mb-8 border-b border-gray-800 pb-3">Admin Portal</h2>

        <nav className="space-y-2 flex-1">
          <Link to="/admin" className="block px-4 py-3 rounded-lg hover:bg-blue-600/10 hover:text-blue-400 text-gray-300 transition-all font-medium border border-transparent hover:border-blue-500/20">
            📊 Overview
          </Link>
          <Link to="/admin/alumni-approvals" className="block px-4 py-3 rounded-lg hover:bg-blue-600/10 hover:text-blue-400 text-gray-300 transition-all font-medium border border-transparent hover:border-blue-500/20">
            ✅ Approvals
          </Link>
          <Link to="/admin/verify-alumni" className="block px-4 py-3 rounded-lg hover:bg-blue-600/10 hover:text-blue-400 text-gray-300 transition-all font-medium border border-transparent hover:border-blue-500/20">
            🛡️ Verify Alumni
          </Link>
        </nav>
      </aside>

      {/* Transparent main area to inherit global dark gradient */}
      <main className="flex-1 p-8 text-gray-200">
        <Outlet />
      </main>
    </div>
  );
}
