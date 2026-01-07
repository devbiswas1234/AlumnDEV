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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Alumni Directory</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search alumni..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded flex-1"
        />

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Departments</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="name_asc">Name (A–Z)</option>
          <option value="name_desc">Name (Z–A)</option>
          <option value="year_desc">Passing Year (Latest)</option>
          <option value="year_asc">Passing Year (Oldest)</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={() => setAvailableOnly(!availableOnly)}
          />
          Available
        </label>
      </div>

      {/* Mentorship Topics Filter */}
      <div className="mb-4">
        <label className="font-semibold">Mentorship Topics</label>
        <MultiSelect
          options={topicOptions}
          value={topics}
          onChange={setTopics}
          labelledBy="Select Topics"
        />
      </div>

      {loading && <p>Loading...</p>}

      {!loading && alumni.length === 0 && (
        <p className="text-gray-500">No alumni found</p>
      )}

      <div className="space-y-4">
        {alumni.map((a) => (
          <div key={a.user_id} className="border p-4 rounded bg-white shadow">
            <h2 className="font-semibold flex items-center gap-2">
              {a.name}

              {a.verified && (
                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                  Verified
                </span>
              )}

              {a.available_for_mentorship ? (
                <span className="text-green-600 text-sm font-semibold">
                  Available
                </span>
              ) : (
                <span className="text-gray-400 text-sm">
                  Unavailable
                </span>
              )}
            </h2>

            <p className="text-sm">{a.department} • {a.passing_year}</p>
            <p className="text-sm text-gray-600">{a.designation}</p>
            <p className="text-sm text-gray-600">{a.location}</p>

            {a.mentorship_topics?.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Topics: {a.mentorship_topics.join(", ")}
              </p>
            )}

            <div className="mt-2 flex gap-2">
              <Link
                to={`/alumni/${a.user_id}`}
                className="text-blue-600 inline-block"
              >
                View Profile
              </Link>

              {userRole === "STUDENT" &&
                a.available_for_mentorship &&
                a.user_id !== currentUserId && (
                  <button
                    onClick={() => handleRequestMentorship(a.user_id)}
                    className="px-3 py-1 text-white bg-green-600 rounded text-sm"
                  >
                    Request Mentorship
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
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
