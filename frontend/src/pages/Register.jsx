import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    batch: "",
    degree: "",
    location: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/signup", form);
      localStorage.setItem("token", res.data.token);

      const me = await api.get("/auth/me");
      setUser(me.data.user);

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded space-y-3"
    >
      <h2 className="text-xl font-bold">Register</h2>

      <input name="name" placeholder="Name" className="input" onChange={handleChange} />
      <input name="email" placeholder="Email" className="input" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" className="input" onChange={handleChange} />

      <select name="role" className="input" onChange={handleChange}>
        <option value="STUDENT">Student</option>
        <option value="ALUMNI">Alumni</option>
      </select>

      <input name="batch" placeholder="Batch (e.g. 2023)" className="input" onChange={handleChange} />
      <input name="degree" placeholder="Degree" className="input" onChange={handleChange} />
      <input name="location" placeholder="Location" className="input" onChange={handleChange} />

      <button className="w-full bg-blue-600 text-white p-2 rounded">
        Register
      </button>
    </form>
  );
}
