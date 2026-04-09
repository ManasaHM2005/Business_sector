import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, signup, googleAuth } from "../api";

const BRANCHES = [
  "Computer Science", "Information Science", "Electronics & Communication",
  "Electrical Engineering", "Mechanical Engineering", "Civil Engineering",
  "Artificial Intelligence & ML", "Data Science",
];

export default function Login() {
  const [mode, setMode] = useState("login"); // login | signup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Signup fields
  const [form, setForm] = useState({
    role: "student", name: "", usn: "", branch: BRANCHES[0],
    email: "", password: "", skills: "", profile_pic: "",
    cgpa: 7.0,
  });

  const setField = (k, v) => setForm({ ...form, [k]: v });

  // ──── Login ────
  const handleLogin = async () => {
    if (!loginEmail || !loginPass) return setError("Please fill in all fields.");
    setLoading(true); setError("");
    try {
      const data = await login(loginEmail, loginPass);
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("student_id", data.student_id);
      localStorage.setItem("user_name", data.name);
      localStorage.setItem("user_role", data.role);
      const routes = { faculty: "/faculty", canteen: "/canteen", placement: "/placement" };
      navigate(routes[data.role] || "/");
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  // ──── Signup ────
  const handleSignup = async () => {
    const { name, usn, email, password, role, branch } = form;
    if (!name || !email || !password || (role === "student" && !usn)) {
      return setError("Please fill in all required fields.");
    }
    setLoading(true); setError("");
    try {
      const data = await signup(form);
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("student_id", data.student_id);
      localStorage.setItem("user_name", data.name);
      localStorage.setItem("user_role", data.role);
      const routes = { faculty: "/faculty", canteen: "/canteen", placement: "/placement" };
      navigate(routes[data.role] || "/");
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  // ──── Google Auth ────
  const handleGoogle = async () => {
    setLoading(true);
    try {
      const data = await googleAuth();
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("student_id", data.student_id);
      localStorage.setItem("user_name", data.name);
      localStorage.setItem("user_role", data.role);
      navigate("/");
    } catch { setError("Google sign-in failed."); }
    setLoading(false);
  };

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("user_id")) {
      const role = localStorage.getItem("user_role");
      navigate(role === "faculty" ? "/faculty" : "/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex w-full max-w-[950px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">

        {/* Left Branding Panel */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-10 flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
          <div className="relative z-10">
            <div className="text-5xl mb-4">🎓</div>
            <h1 className="text-3xl font-extrabold text-white mb-2">AI Campus Brain</h1>
            <p className="text-white/75 text-sm leading-relaxed mb-8">
              Intelligent, context-aware system integrating multiple domains of campus life through autonomous AI agents.
            </p>
            <div className="space-y-3 text-sm">
              {["🧠 5 Coordinated AI Agents", "📊 Predictive Intelligence", "🔗 MCP Context Protocol", "⚡ Action-Taking AI"].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-white/90 bg-white/10 rounded-lg px-3 py-2">{f}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 bg-gray-900 p-8 flex items-center justify-center min-h-[600px]">
          <div className="w-full max-w-sm">

            {/* ──── LOGIN MODE ──── */}
            {mode === "login" && (<>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
              <p className="text-gray-500 text-sm mb-6">Log in to your campus dashboard</p>

              <label className="block text-xs text-gray-400 mb-1 font-medium">Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full mb-3 px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
                onKeyDown={e => e.key === "Enter" && handleLogin()} />

              <label className="block text-xs text-gray-400 mb-1 font-medium">Password</label>
              <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full mb-5 px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition"
                onKeyDown={e => e.key === "Enter" && handleLogin()} />

              <button onClick={handleLogin} disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition mb-2 disabled:opacity-50">
                {loading ? "Signing in..." : "Login"}
              </button>

              <div className="relative my-4"><hr className="border-white/10" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 px-3 text-xs text-gray-500">or</span>
              </div>

              <button onClick={handleGoogle} disabled={loading}
                className="w-full py-2.5 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2 mb-3">
                <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="G" className="w-5" />
                Sign in with Google
              </button>

              <button onClick={() => { setMode("signup"); setError(""); }}
                className="w-full py-2.5 text-center text-sm text-blue-400 hover:text-blue-300 transition">
                New here? <strong>Create Profile →</strong>
              </button>

              {error && <p className="mt-2 text-center text-sm text-red-400">{error}</p>}

              <p className="mt-4 text-center text-xs text-gray-600 bg-white/3 rounded-lg p-2">
                Demo: <strong className="text-gray-400">student@college.edu</strong> / <strong className="text-gray-400">password123</strong>
              </p>
            </>)}

            {/* ──── SIGNUP MODE ──── */}
            {mode === "signup" && (<>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => { setMode("login"); setError(""); }}
                  className="text-gray-500 hover:text-white transition text-lg">←</button>
                <h2 className="text-xl font-bold text-white">Create Your Profile</h2>
              </div>

              {/* Role Selection */}
              <label className="block text-xs text-gray-400 mb-2 font-medium">I am a</label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { id: "student", icon: "🎓" },
                  { id: "faculty", icon: "👨‍🏫" },
                  { id: "canteen", icon: "🍔" },
                  { id: "placement", icon: "💼" }
                ].map(r => (
                  <button key={r.id} onClick={() => setField("role", r.id)}
                    className={`py-2 rounded-lg font-semibold text-xs capitalize transition border
                      ${form.role === r.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent"
                        : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"}`}>
                    {r.icon} {r.id}
                  </button>
                ))}
              </div>

              <label className="block text-xs text-gray-400 mb-1 font-medium">Full Name *</label>
              <input value={form.name} onChange={e => setField("name", e.target.value)} placeholder="Alice Johnson"
                className="w-full mb-3 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />

              {form.role === "student" && (<>
                <label className="block text-xs text-gray-400 mb-1 font-medium">USN (University Seat Number) *</label>
                <input value={form.usn} onChange={e => setField("usn", e.target.value.toUpperCase())} placeholder="1RV22CS001"
                  className="w-full mb-3 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none uppercase" />
              </>)}

              <label className="block text-xs text-gray-400 mb-1 font-medium">Branch / Department *</label>
              <select value={form.branch} onChange={e => setField("branch", e.target.value)}
                className="w-full mb-3 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none">
                {BRANCHES.map(b => <option key={b} value={b} className="bg-gray-900">{b}</option>)}
              </select>

              <label className="block text-xs text-gray-400 mb-1 font-medium">Email *</label>
              <input type="email" value={form.email} onChange={e => setField("email", e.target.value)} placeholder="alice@college.edu"
                className="w-full mb-3 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />

              <label className="block text-xs text-gray-400 mb-1 font-medium">Create Password *</label>
              <input type="password" value={form.password} onChange={e => setField("password", e.target.value)} placeholder="••••••••"
                className="w-full mb-3 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />

              {form.role === "student" && (<>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Skills (CSV) *</label>
                <input value={form.skills} onChange={e => setField("skills", e.target.value)} placeholder="Python, React, SQL"
                  className="w-full mb-3 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
              </>)}

              {form.role === "student" && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-medium">Initial CGPA *</label>
                    <input type="number" step="0.01" value={form.cgpa} onChange={e => setField("cgpa", parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-medium">Profile Photo URL</label>
                    <input value={form.profile_pic} onChange={e => setField("profile_pic", e.target.value)} placeholder="https://..."
                      className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
              )}

              {form.role !== "student" && (
                <>
                  <label className="block text-xs text-gray-400 mb-1 font-medium">Profile Photo URL</label>
                  <input value={form.profile_pic} onChange={e => setField("profile_pic", e.target.value)} placeholder="https://..."
                    className="w-full mb-4 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
                </>
              )}

              <button onClick={handleSignup} disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
                {loading ? "Creating..." : "Create Profile & Login →"}
              </button>

              {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
            </>)}

          </div>
        </div>
      </div>
    </div>
  );
}
