import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ Login → get token
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      // 2️⃣ Fetch full user using token
      const me = await api.get("/auth/me");

      // 3️⃣ Store full user object (DB shape)
      setUser(me.data.user);

      // 4️⃣ Redirect
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-sm mx-auto mt-20 p-6 bg-white shadow rounded"
    >
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <input
        className="w-full mb-3 p-2 border rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="w-full mb-3 p-2 border rounded"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="w-full bg-blue-600 text-white p-2 rounded">
        Login
      </button>
    </form>
  );
}
