import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import loginIllustration from "../assets/login_illustration.png";

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
    <div className="flex min-h-[600px] rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto mt-10 bg-gray-900 border border-gray-800">
      {/* LEFT: IMAGE */}
      <div className="hidden md:block w-1/2 relative bg-gray-800 flex-shrink-0">
        <img 
          src={loginIllustration} 
          alt="Alumni Network" 
          className="absolute inset-0 w-full h-full object-cover opacity-90" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
        <div className="absolute bottom-10 left-10 right-10">
          <h3 className="text-3xl font-bold text-white mb-2">Connect globally.</h3>
          <p className="text-gray-300">Join our growing network of alumni and discover new opportunities, mentorships, and collaborations directly at your fingertips.</p>
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-10 md:p-14 bg-gray-900">
        <form onSubmit={handleLogin} className="w-full max-w-md mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Please enter your credentials to login.</p>
          </div>

          <div className="space-y-5">
            <input
              className="input w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="input w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition-colors shadow-lg shadow-blue-600/30">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
