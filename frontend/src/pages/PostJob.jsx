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
    <div className="p-8 max-w-lg mx-auto bg-gray-800 border border-gray-700 shadow-xl rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6 text-white text-center">Post a Job</h1>

      <div className="space-y-4">
        {["title","company","location"].map(f => (
          <input
            key={f}
            className="input w-full"
            placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
            value={form[f]}
            onChange={e => setForm({ ...form, [f]: e.target.value })}
          />
        ))}

        <textarea
          className="input w-full min-h-[120px]"
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <button
          onClick={submit}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-md w-full font-medium transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? "Posting..." : "Post Job"}
        </button>
      </div>

      {msg && <p className={`mt-4 text-center font-medium ${msg.includes("success") ? "text-green-500" : "text-red-500"}`}>{msg}</p>}
    </div>
  );
}
