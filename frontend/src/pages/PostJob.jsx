import { useState } from "react";
import api from "../api/axios";

export default function PostJob() {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    description: ""
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setMsg("");
    try {
      await api.post("/jobs", form);
      setMsg("Job posted successfully!");
      setForm({ title:"", company:"", location:"", description:"" });
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.error || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Post a Job</h1>

      {["title","company","location"].map(f => (
        <input
          key={f}
          className="w-full border p-2 mb-2 rounded"
          placeholder={f}
          value={form[f]}
          onChange={e => setForm({ ...form, [f]: e.target.value })}
        />
      ))}

      <textarea
        className="w-full border p-2 mb-3 rounded"
        placeholder="Description"
        value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
      />

      <button
        onClick={submit}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Posting..." : "Post Job"}
      </button>

      {msg && <p className={`mt-2 ${msg.includes("success") ? "text-green-600" : "text-red-600"}`}>{msg}</p>}
    </div>
  );
}
