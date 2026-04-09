import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addPlacementDrive, fetchContext } from "../api";

export default function PlacementDashboard() {
  const [drive, setDrive] = useState({
    company: "", role: "", date: "", min_cgpa: 7.0, package: "8 LPA", skills_required: ""
  });
  const [mcpLogs, setMcpLogs] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userName = localStorage.getItem("user_name") || "Officer";
  const avatar = userName.charAt(0).toUpperCase();

  const loadMcp = async () => {
    try {
      const data = await fetchContext();
      if (data.history) setMcpLogs(data.history.slice(-8).reverse());
    } catch (e) {}
  };

  useEffect(() => {
    if (localStorage.getItem("user_role") !== "placement") navigate("/login");
    loadMcp();
    const id = setInterval(loadMcp, 3000);
    return () => clearInterval(id);
  }, []);

  const handleAddDrive = async () => {
    if (!drive.company || !drive.role || !drive.skills_required) return setMsg("❌ Please fill all fields.");
    setLoading(true);
    try {
      await addPlacementDrive(drive);
      setMsg(`🚀 Drive for ${drive.company} broadcasted successfully!`);
      setDrive({ company: "", role: "", date: "", min_cgpa: 7.0, package: "8 LPA", skills_required: "" });
    } catch (e) {
      setMsg("❌ Failed to broadcast drive.");
    }
    setLoading(false);
    setTimeout(() => setMsg(""), 4000);
  };

  const logout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-[#02040a] text-gray-100 p-6 flex flex-col items-center">
      
      {/* Premium Navbar */}
      <nav className="w-full max-w-6xl flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 py-4 shadow-2xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-xl font-bold shadow-lg border border-white/20">
            {avatar}
          </div>
          <div>
            <span className="block text-lg font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent uppercase tracking-tight">Placement Career Hub</span>
            <span className="block text-xs text-gray-400">Targeting Excellence for {userName}</span>
          </div>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 border border-white/10 px-4 py-2 rounded-lg hover:text-red-400 hover:border-red-500/30 transition">Logout</button>
      </nav>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Broadcast Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/40 p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-blue-500 text-3xl">📢</span> 
              Broadcast Recruitment Drive
            </h2>
            
            {msg && <div className={`mb-6 p-3 rounded-lg text-sm text-center animate-pulse border ${msg.includes('❌') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>{msg}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Input label="Company Name" placeholder="e.g. Amazon" value={drive.company} onChange={v => setDrive({...drive, company: v})} />
              <Input label="Role / Title" placeholder="e.g. Frontend Specialist" value={drive.role} onChange={v => setDrive({...drive, role: v})} />
              <Input label="Drive Date" type="date" value={drive.date} onChange={v => setDrive({...drive, date: v})} />
              <Input label="Package Offered" placeholder="e.g. 18 LPA" value={drive.package} onChange={v => setDrive({...drive, package: v})} />
            </div>

            <div className="mb-8">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Mapping Skills (AI TARGETING Tags)</label>
              <textarea 
                value={drive.skills_required} onChange={e => setDrive({...drive, skills_required: e.target.value})}
                placeholder="Python, React, Tailwind, SQL (Comma separated)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none resize-none min-h-[100px] text-sm leading-relaxed" 
              />
              <p className="text-[10px] text-indigo-400 mt-2 italic px-1">AI Agent will automatically match these tags against student profile skills.</p>
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center mb-3 px-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Minimal CGPA Threshold</label>
                <span className="text-xl font-black text-blue-400 font-mono tracking-tighter">{drive.min_cgpa.toFixed(1)}</span>
              </div>
              <input type="range" min="0" max="10" step="0.1" value={drive.min_cgpa} onChange={e => setDrive({...drive, min_cgpa: parseFloat(e.target.value)})}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>

            <button onClick={handleAddDrive} disabled={loading}
              className="group relative w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black text-xl hover:scale-[1.01] active:scale-[0.99] transition shadow-lg shadow-blue-500/20 overflow-hidden">
              {loading ? "Distributing to students..." : "INITIATE BROADCAST"}
              <div className="absolute top-0 -right-full w-full h-full bg-white/10 skew-x-[45deg] group-hover:right-full transition-all duration-700"></div>
            </button>
          </div>
        </div>

        {/* Right: Live Monitor */}
        <div className="space-y-6">
          <div className="bg-black/30 border border-indigo-500/20 rounded-3xl p-6 shadow-xl h-[645px] flex flex-col overflow-hidden">
            <h3 className="text-indigo-400 font-bold mb-5 flex items-center justify-between uppercase tracking-widest text-xs">
              <span>📡 MCP Network Feed</span>
              <div className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                <span className="text-[8px] opacity-40">ENCRYPTED</span>
              </div>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {mcpLogs.length === 0 ? <p className="text-gray-500 text-xs italic">Awaiting agent traffic...</p> : null}
              {mcpLogs.map((log, i) => (
                <div key={i} className={`p-4 rounded-xl border animate-[slideUp_0.3s] text-[11px] leading-relaxed transition-all
                  ${log.agent === "PlacementAgent" ? "bg-indigo-500/10 border-indigo-500/30 text-white" : "bg-white/5 border-white/10 text-gray-400"}`}>
                  <div className="flex justify-between items-center mb-1.5 font-bold uppercase text-[9px]">
                    <span className={log.agent === "PlacementAgent" ? "text-indigo-400" : "text-gray-500"}>{log.agent}</span>
                    <span className="opacity-40">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  </div>
                  {log.action}: <span className="opacity-80 ">{log.details}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function Input({ label, type="text", placeholder, value, onChange }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition placeholder:text-gray-700" />
    </div>
  );
}
