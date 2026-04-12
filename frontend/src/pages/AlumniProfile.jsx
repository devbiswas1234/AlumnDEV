import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function AlumniProfile() {
  const { id } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [requestStatus, setRequestStatus] = useState(null);
  const [sending, setSending] = useState(false);

  const isOwnProfile = !id || Number(id) === user?.id;
  const isOwner = user?.id === profile?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = isOwnProfile
          ? await api.get("/alumni/me")
          : await api.get(`/alumni/${id}`);

        const p = res.data.profile;

        setProfile(p);

        // ✅ IMPORTANT: initialize FULL form (prevents disappearing fields)
        setForm({
          name: p.name || "",
          batch: p.batch || "",
          degree: p.degree || "",
          location: p.location || "",
          photo_url: p.photo_url || "",
          bio: p.bio || "",
          department: p.department || "",
          passing_year: p.passing_year || "",
          company: p.company || "",
          designation: p.designation || "",
          linkedin_url: p.linkedin_url || "",
          available_for_mentorship: !!p.available_for_mentorship,
        });
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const saveChanges = async () => {
    try {
      // ✅ SINGLE correct API
      const res = await api.put("/alumni/me", form);

      setProfile({ ...profile, ...form });
      setEditing(false);
      alert("Profile updated successfully");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save profile");
    }
  };

  // 🔹 SEND MENTORSHIP REQUEST
  const sendRequest = async () => {
    if (!profile) return;
    setSending(true);

    try {
      const res = await api.post(`/mentorship/request/${profile.user_id}`, {
        message,
      });
      setRequestStatus(res.data.request.status);
      alert("Request sent");
      setMessage("");
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-400">Loading...</p>;
  if (!profile) return <p className="p-6 text-red-500">Profile not found</p>;

  return (
    <div className="max-w-5xl mx-auto mt-8 mb-12">
      {/* Hero Banner Area */}
      <div className="relative h-48 md:h-64 rounded-t-2xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-gray-900">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[2px]"></div>
      </div>

      {/* Main Container */}
      <div className="bg-[#0f1422] border border-gray-800 rounded-b-2xl shadow-2xl relative px-6 md:px-12 pb-12">
        
        {/* Profile Avatar & Quick Actions Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-16 md:-mt-20 mb-8 z-10 relative gap-4">
          <div className="flex items-end gap-6 w-full">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-800 rounded-full border-4 border-[#0f1422] shadow-xl overflow-hidden flex items-center justify-center text-5xl text-gray-500 font-bold">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile.name?.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="flex-1 pb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
                {profile.name}
                {profile.verified && (
                  <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/20 px-2 py-1 rounded-full font-bold uppercase tracking-wider align-middle mt-1">
                    Verified
                  </span>
                )}
              </h1>
              <p className="text-xl text-blue-400 font-medium mt-1">{profile.designation || "Alumni Member"}</p>
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                {profile.company || "Not Specified"} • {profile.location || "Location unlisted"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-3">
            {isOwner ? (
              <button
                onClick={() => setEditing(!editing)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-medium transition-colors border border-gray-700 w-full md:w-auto"
              >
                {editing ? "Cancel Edit" : "Edit Profile"}
              </button>
            ) : (
              profile.available_for_mentorship && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 border border-blue-500 text-white transition-all px-5 py-2 rounded-lg font-semibold hover:-translate-y-0.5 w-full md:w-auto"
                >
                  Request Mentorship
                </button>
              )
            )}
          </div>
        </div>

        {/* Content Body */}
        {editing ? (
          <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800 space-y-6">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Edit Your Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label><input name="name" value={form.name} onChange={handleChange} className="input" placeholder="Name" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Photo URL</label><input name="photo_url" value={form.photo_url} onChange={handleChange} className="input" placeholder="https://..." /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Current Company</label><input name="company" value={form.company} onChange={handleChange} className="input" placeholder="Company Name" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Role / Designation</label><input name="designation" value={form.designation} onChange={handleChange} className="input" placeholder="Software Engineer" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Degree</label><input name="degree" value={form.degree} onChange={handleChange} className="input" placeholder="B.Tech" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Department</label><input name="department" value={form.department} onChange={handleChange} className="input" placeholder="Computer Science" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Batch</label><input name="batch" value={form.batch} onChange={handleChange} className="input" placeholder="2018-2022" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Passing Year</label><input name="passing_year" value={form.passing_year} onChange={handleChange} className="input" placeholder="2022" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Location</label><input name="location" value={form.location} onChange={handleChange} className="input" placeholder="New York, NY" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">LinkedIn Profile</label><input name="linkedin_url" value={form.linkedin_url} onChange={handleChange} className="input" placeholder="https://linkedin.com/in/..." /></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bio / About Me</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="input min-h-[120px]"
                placeholder="Tell the community about yourself..."
              />
            </div>

            <div className="p-4 bg-gray-800/80 rounded-lg border border-gray-700/50 mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.available_for_mentorship}
                  onChange={(e) => setForm({ ...form, available_for_mentorship: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 bg-gray-900 border-gray-700"
                />
                <div>
                  <span className="text-white font-medium block">Available for Mentorship</span>
                  <span className="text-gray-400 text-sm">Allow students to send you mentorship connection requests.</span>
                </div>
              </label>
            </div>

            <button onClick={saveChanges} className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg shadow-green-600/20">
              Save Profile Details
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Bio & Core Info */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-gray-900/40 p-6 rounded-xl border border-gray-800/80 shadow-inner">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  About {profile.name.split(' ')[0]}
                </h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {profile.bio || "This alumni hasn't written a biography yet."}
                </p>
              </div>

              {profile.mentorship_topics && profile.mentorship_topics.length > 0 && (
                <div className="bg-gray-900/40 p-6 rounded-xl border border-gray-800/80 shadow-inner">
                  <h3 className="text-lg font-bold text-white mb-3">Mentorship Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.mentorship_topics.map(topic => (
                      <span key={topic} className="px-3 py-1.5 bg-indigo-900/30 text-indigo-300 border border-indigo-500/20 rounded-lg text-sm font-medium">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Academic Details & Links */}
            <div className="space-y-6">
              
              <div className="bg-[#151b2b]/50 p-6 rounded-xl border border-gray-800 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Academic History</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Degree</p>
                    <p className="text-gray-200 font-medium">{profile.degree || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Department</p>
                    <p className="text-gray-200 font-medium">{profile.department || "-"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Batch</p>
                      <p className="text-gray-200 font-medium">{profile.batch || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Class Of</p>
                      <p className="text-gray-200 font-medium">{profile.passing_year || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#151b2b]/50 p-6 rounded-xl border border-gray-800 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Mentorship Status</h3>
                <div className={`p-4 rounded-lg flex items-center gap-3 border ${profile.available_for_mentorship ? 'bg-green-900/10 border-green-500/20' : 'bg-gray-800/50 border-gray-700/50'}`}>
                  <div className={`w-3 h-3 rounded-full ${profile.available_for_mentorship ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-500'}`}></div>
                  <span className={`font-semibold ${profile.available_for_mentorship ? 'text-green-400' : 'text-gray-400'}`}>
                    {profile.available_for_mentorship ? 'Accepting Requests' : 'Currently Unavailable'}
                  </span>
                </div>
              </div>

              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#0e76a8]/10 hover:bg-[#0e76a8]/20 border border-[#0e76a8]/30 text-[#0e76a8] hover:text-[#005582] text-white px-4 py-3 rounded-xl transition-all font-semibold">
                  <svg className="w-5 h-5 text-[#0e76a8]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                  Connect on LinkedIn
                </a>
              )}

            </div>
          </div>
        )}
      </div>

      {/* Mentorship Request Modal Component (Already standard) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">Request Mentorship</h2>
            <textarea
              className="input min-h-[120px] mb-4"
              placeholder={`Write a short message to ${profile.name}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-500/20"
                onClick={sendRequest}
                disabled={sending}
              >
                {sending ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
