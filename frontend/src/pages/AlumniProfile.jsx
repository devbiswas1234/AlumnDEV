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
  const [requestStatus, setRequestStatus] = useState(null); // PENDING, QUEUED, etc
  const [sending, setSending] = useState(false);

  const isOwner = user?.id === profile?.user_id;

  useEffect(() => {
    if (!id) return;

    api
      .get(`/alumni/${id}`)
      .then((res) => {
        setProfile(res.data.profile);
        setForm(res.data.profile || {});
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const saveChanges = async () => {
    try {
      // Save mentorship availability
      await api.put("/alumni/mentorship-settings", {
        available_for_mentorship: form.available_for_mentorship,
      });

      // Save profile details
      const res = await api.post("/alumni/me", form);
      setProfile(res.data.profile);
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
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
      setRequestStatus(res.data.request.status); // PENDING, QUEUED
      alert(
        res.data.request.status === "QUEUED"
          ? "Mentor is full, you are added to the queue"
          : "Request sent"
      );
      setMessage("");
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!profile) return <p className="p-6 text-red-600">Profile not found</p>;

  // Profile completion calculation
  const completionFields = [
    "photo_url",
    "bio",
    "department",
    "passing_year",
    "company",
    "designation",
    "linkedin_url",
    "location",
    "degree",
    "batch",
  ];

  const completedCount = completionFields.filter(
    (field) => profile[field] && profile[field].toString().trim() !== ""
  ).length;

  const completionPercent = Math.round(
    (completedCount / completionFields.length) * 100
  );

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded space-y-4">
      {/* PROFILE COMPLETION */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold">Profile Completion</span>
          <span>{completionPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded h-2">
          <div
            className="bg-green-600 h-2 rounded"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {profile.photo_url && (
        <img
          src={profile.photo_url}
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto"
        />
      )}

      <h1 className="text-2xl font-bold text-center">
        {profile.name}{" "}
        {profile.verified && (
          <span className="text-green-600 font-bold">✔ Verified</span>
        )}
      </h1>

      {editing ? (
        <>
          <input
            name="photo_url"
            value={form.photo_url || ""}
            onChange={handleChange}
            placeholder="Profile photo URL"
            className="w-full border p-2 rounded"
          />

          <textarea
            name="bio"
            value={form.bio || ""}
            onChange={handleChange}
            placeholder="Bio"
            className="w-full border p-2 rounded"
          />

          <input
            name="linkedin_url"
            value={form.linkedin_url || ""}
            onChange={handleChange}
            placeholder="LinkedIn URL"
            className="w-full border p-2 rounded"
          />

          {/* MENTORSHIP AVAILABILITY */}
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={!!form.available_for_mentorship}
              onChange={(e) =>
                setForm({
                  ...form,
                  available_for_mentorship: e.target.checked,
                })
              }
            />
            Available for mentorship
          </label>

          <button
            onClick={saveChanges}
            className="bg-green-600 text-white px-4 py-2 rounded mt-3"
          >
            Save
          </button>
        </>
      ) : (
        <>
          <p><b>Batch:</b> {profile.batch || "-"}</p>
          <p><b>Degree:</b> {profile.degree || "-"}</p>
          <p><b>Location:</b> {profile.location || "-"}</p>
          <p><b>Department:</b> {profile.department || "-"}</p>
          <p><b>Passing Year:</b> {profile.passing_year || "-"}</p>
          <p><b>Company:</b> {profile.company || "-"}</p>
          <p><b>Designation:</b> {profile.designation || "-"}</p>
          <p><b>Bio:</b> {profile.bio || "-"}</p>
          <p>
            <b>LinkedIn:</b>{" "}
            {profile.linkedin_url ? (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600"
              >
                {profile.linkedin_url}
              </a>
            ) : (
              "-"
            )}
          </p>

          {/* STUDENT — REQUEST MENTORSHIP */}
          {user?.role === "STUDENT" && !isOwner && (
            <>
              <button
                onClick={() => setShowModal(true)}
                disabled={requestStatus === "PENDING" || requestStatus === "QUEUED"}
                className={`mt-2 px-4 py-2 rounded text-white ${
                  requestStatus === "PENDING" || requestStatus === "QUEUED"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600"
                }`}
              >
                {requestStatus === "PENDING"
                  ? "Request Pending"
                  : requestStatus === "QUEUED"
                  ? "You are in Queue"
                  : "Request Mentorship"}
              </button>
            </>
          )}

          {/* OWNER — EDIT */}
          {isOwner && (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
            >
              Edit Profile
            </button>
          )}
        </>
      )}

      {/* REQUEST MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded shadow max-w-md w-full">
            <h2 className="font-bold text-lg mb-3">Request Mentorship</h2>

            <textarea
              className="w-full border rounded p-2"
              placeholder="Write your message…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>

              <button
                onClick={sendRequest}
                disabled={sending}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
