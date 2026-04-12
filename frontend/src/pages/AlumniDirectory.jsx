import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { MultiSelect } from "react-multi-select-component";

export default function AlumniDirectory() {
  const { user } = useAuth(); // currentUser: { id, role }
  const currentUserId = user?.id;
  const userRole = user?.role;

  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState("name_asc");
  const [topics, setTopics] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const topicOptions = [
    { label: "Web Development", value: "Web Development" },
    { label: "Data Science", value: "Data Science" },
    { label: "AI/ML", value: "AI/ML" },
    { label: "Blockchain", value: "Blockchain" },
    { label: "Networking", value: "Networking" },
  ];

  const fetchAlumni = async () => {
    try {
      setLoading(true);

      const res = await api.get("/alumni/search", {
        params: {
          q: search || undefined,
          department: department || undefined,
          available: availableOnly ? "true" : undefined,
          sort,
          topics: topics.map((t) => t.value).join(",") || undefined,
          page,
          limit: 6,
        },
      });

      setAlumni(res.data.alumni || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [page]);

  useEffect(() => {
    setPage(1);
    fetchAlumni();
  }, [search, department, availableOnly, sort, topics]);

  const handleRequestMentorship = async (alumniId) => {
    try {
      await api.post(`/mentorship/request/${alumniId}`);
      alert("Mentorship request sent!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Alumni Directory</h1>
          <p className="text-gray-400 mt-2">Connect and network with fellow graduates.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0f1422]/60 backdrop-blur-md border border-gray-800 p-5 rounded-2xl mb-8 flex flex-wrap gap-4 items-center shadow-lg">
        <input
          type="text"
          placeholder="Search by name, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1 min-w-[200px] bg-gray-900/50"
        />

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="input w-auto bg-gray-900/50 cursor-pointer"
        >
          <option value="">All Departments</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input w-auto bg-gray-900/50 cursor-pointer"
        >
          <option value="name_asc">Name (A–Z)</option>
          <option value="name_desc">Name (Z–A)</option>
          <option value="year_desc">Latest Passing Year</option>
          <option value="year_asc">Oldest Passing Year</option>
        </select>

        <label className="flex items-center gap-3 cursor-pointer bg-gray-900/50 border border-gray-700/50 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={() => setAvailableOnly(!availableOnly)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-gray-800 border-gray-600"
          />
          <span className="text-gray-200 font-medium text-sm">Available Only</span>
        </label>
      </div>

      {/* Mentorship Topics Filter */}
      <div className="mb-10 max-w-2xl text-gray-200">
        <label className="block font-medium text-sm text-gray-400 mb-2">Filter by Mentorship Topics</label>
        <MultiSelect
          options={topicOptions}
          value={topics}
          onChange={setTopics}
          labelledBy="Select Topics"
          className="premium-multiselect text-black"
        />
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && alumni.length === 0 && (
        <div className="text-center py-20 bg-[#0f1422]/30 rounded-2xl border border-gray-800">
          <h3 className="text-xl text-gray-300 font-semibold mb-2">No alumni found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumni.map((a) => (
          <div key={a.user_id} className="group border border-gray-800 bg-[#0f1422]/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-bold text-xl text-white truncate pr-2">
                  {a.name}
                </h2>
                
                <div className="flex flex-col gap-1 items-end flex-shrink-0">
                  {a.verified && (
                    <span className="text-[10px] uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4 space-y-2">
                <p className="text-sm font-medium text-blue-300 bg-blue-900/20 inline-block px-2.5 py-1 rounded-md border border-blue-900/30">
                  {a.designation || "No Designation"}
                </p>
                <div className="flex gap-2 text-xs text-gray-400 font-medium">
                  <span className="bg-gray-800/80 px-2 py-1 rounded border border-gray-700/50">{a.department || "-"}</span>
                  <span className="bg-gray-800/80 px-2 py-1 rounded border border-gray-700/50">Class of {a.passing_year || "-"}</span>
                </div>
                <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {a.location || "Location unlisted"}
                </p>
              </div>

              {a.available_for_mentorship && a.mentorship_topics?.length > 0 && (
                <div className="mb-4 border-t border-gray-800/50 pt-4">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">Mentoring In</p>
                  <div className="flex flex-wrap gap-1.5">
                    {a.mentorship_topics.slice(0,3).map(topic => (
                      <span key={topic} className="text-[11px] text-gray-300 bg-gray-800/60 px-2 py-1 rounded-full border border-gray-700">
                        {topic}
                      </span>
                    ))}
                    {a.mentorship_topics.length > 3 && (
                      <span className="text-[11px] text-gray-400 bg-gray-800/30 px-2 py-1 rounded-full border border-gray-700/50">
                        +{a.mentorship_topics.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3 items-center pt-4 border-t border-gray-800">
              <Link
                to={`/alumni/${a.user_id}`}
                className="flex-1 text-center bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-colors py-2 rounded-lg text-sm font-semibold"
              >
                View Profile
              </Link>

              {userRole === "STUDENT" &&
                a.available_for_mentorship &&
                a.user_id !== currentUserId && (
                  <button
                    onClick={() => handleRequestMentorship(a.user_id)}
                    className="flex-1 text-center bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 border border-blue-500 text-white transition-all py-2 rounded-lg text-sm font-semibold hover:-translate-y-0.5"
                  >
                    Request
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 border border-gray-700 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800 transition-colors"
        >
          Previous
        </button>

        <span className="text-sm text-gray-400">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 border border-gray-700 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
