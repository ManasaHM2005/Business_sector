import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCoordinator, fetchContext } from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [mcpLogs, setMcpLogs] = useState([]);
  const [connected, setConnected] = useState(true);
  const navigate = useNavigate();

  const userName = localStorage.getItem("user_name") || "Student";
  const avatar = userName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!localStorage.getItem("user_id")) { navigate("/login"); return; }
    if (localStorage.getItem("user_role") === "faculty") { navigate("/faculty"); return; }
    load();
    const id = setInterval(load, 2000); // Poll faster for live demo feel
    return () => clearInterval(id);
  }, []);

  const load = async () => {
    try { 
      const d = await fetchCoordinator(); 
      setData(d); 
      setConnected(true); 
      
      const ctx = await fetchContext();
      if(ctx.history) {
        // Find recent faculty overrides to highlight
        const recentOverrides = ctx.history.filter(h => h.agent === "FacultyAgent" && h.severity).slice(-3).reverse();
        setMcpLogs(recentOverrides);
      }
    }
    catch { setConnected(false); }
  };

  const logout = () => { localStorage.clear(); navigate("/login"); };

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  const { student, faculty, canteen, placement, summary, cross_insights } = data;
  const s = student?.student || { name: userName };
  const stats = student?.stats || {};

  return (
    <div className="min-h-screen text-gray-100 flex flex-col pt-20">
      
      {/* Navbar Fixed */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-[#0a0e1a]/90 border-b border-white/8 px-6 py-3 flex items-center justify-between">
        <span className="text-lg font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">🎓 AI Campus Brain</span>
        
        <div className="flex items-center gap-4">
          <span className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${connected ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
            {connected && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>}
            {connected ? "MCP Linked" : "Disconnected"}
          </span>
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <span className="text-sm font-medium text-gray-300">{s.name}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md">
              {avatar}
            </div>
            <button onClick={logout} className="text-xs text-gray-400 border border-white/10 px-2 py-1 rounded hover:text-red-400 transition ml-2">Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 px-6 pb-6 max-w-[1600px] mx-auto w-full">

        {/* Top: AI Summary & Live MCP Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          
          <div className="lg:col-span-3 p-5 rounded-xl bg-gradient-to-r from-blue-500/15 to-purple-500/15 border border-purple-500/30 animate-[fadeIn_0.6s] flex items-start gap-4">
            <span className="text-3xl drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">✨</span>
            <div><p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">AI Daily Summary</p>
              <p className="text-sm leading-relaxed text-gray-200">{summary}</p></div>
          </div>

          <div className="lg:col-span-1 p-4 rounded-xl bg-black/40 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-[pulse_2s_infinite]"></div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span> Live MCP Overrides (Faculty)
            </p>
            {mcpLogs.length === 0 ? <p className="text-xs text-gray-500">No overrides active.</p> : null}
            <div className="space-y-2">
              {mcpLogs.map((log, i) => (
                <div key={i} className="text-[11px] leading-tight text-gray-300 border-l-2 border-purple-500 pl-2">
                  <span className="font-semibold text-purple-400">{log.action}</span>: {log.details}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Cross-Insight Pills */}
        {cross_insights?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {cross_insights.map((i, idx) => (
              <span key={idx} className={`text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 border backdrop-blur-sm
                ${i.severity === "warning" ? "text-amber-400 bg-amber-500/10 border-amber-500/25 shadow-[0_0_10px_rgba(245,158,11,0.1)]" :
                  i.severity === "success" ? "text-green-400 bg-green-500/10 border-green-500/25 shadow-[0_0_10px_rgba(16,185,129,0.1)]" :
                  "text-blue-400 bg-blue-500/10 border-blue-500/25 shadow-[0_0_10px_rgba(59,130,246,0.1)]"}`}>
                {i.icon} {i.message}
              </span>
            ))}
          </div>
        )}

        {/* Dashboard Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">

          {/* Student Profile */}
          <Card title="👩‍🎓 Student Profile" badge={s.year}>
            <div className="flex gap-4 items-center mb-4 pb-4 border-b border-white/5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl font-bold">
                {avatar}
              </div>
              <div>
                <h4 className="text-lg font-bold">{s.name}</h4>
                <p className="text-gray-500 text-sm">{s.major} | USN: {s.usn || "N/A"}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Stat value={`${s.attendance}%`} label="Attendance" />
              <Stat value={s.cgpa} label="CGPA" />
              <Stat value={stats.pending} label="Pending" />
              <Stat value={stats.today_classes_count} label="Classes" />
            </div>
          </Card>

          {/* Alerts */}
          <Card title="⚠️ Smart Alerts" badge={student?.alerts?.length}>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {student?.alerts?.map((a, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg text-sm border-l-4 transition-all duration-300 hover:translate-x-1
                  ${a.type === "danger" ? "bg-red-500/10 border-red-500 text-red-100" :
                    a.type === "warning" ? "bg-amber-500/10 border-amber-500 text-amber-100" :
                    a.type === "success" ? "bg-green-500/10 border-green-500 text-green-100" :
                    "bg-blue-500/10 border-blue-500 text-blue-100"}`}>
                  <span className="text-lg mt-0.5">{a.icon}</span><span className="leading-snug">{a.message}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Today's Schedule */}
          <Card title="📅 Today's Schedule">
            {student?.today_classes?.length > 0 ? (
              <div className="space-y-2">
                {student.today_classes.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 text-sm hover:bg-white/10 transition">
                    <span className="font-bold text-cyan-400 w-20">{c.time}</span>
                    <span className="flex-1 ml-2 font-medium">{c.subject}</span>
                    <span className="text-gray-400 text-xs px-2 py-1 bg-black/30 rounded">{c.room}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 text-sm italic">No classes today 🎉</p>}
          </Card>

          {/* Placement */}
          <Card className="xl:row-span-2" title="💼 Placement Hub" badge={`${placement?.stats?.eligible_count}/${placement?.stats?.total_drives} eligible`}>
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">🎯 AI Recommendations</p>
            <div className="bg-white/5 rounded-lg p-3 mb-4 border border-white/5">
              {placement?.recommendations?.map((r, i) => (
                <div key={i} className="flex items-start gap-2 py-1 text-sm text-gray-300">
                  <span className="opacity-80">{r.icon}</span><span className="leading-snug">{r.message}</span>
                </div>
              ))}
            </div>
            
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">📋 Eligible Drives</p>
            {placement?.eligible_drives?.map((d, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-white/5 to-transparent border border-white/5 mb-2 text-sm hover:border-indigo-500/30 transition">
                <div>
                  <p className="font-bold text-white">{d.company} <span className="text-gray-400 font-normal">— {d.role}</span></p>
                  <p className="text-gray-500 text-xs mt-1">📅 {d.date} • Min CGPA: {d.min_cgpa}</p>
                </div>
                <span className="text-green-400 font-black text-lg bg-green-400/10 px-2 py-1 rounded">{d.package}</span>
              </div>
            ))}

            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-5 mb-3">📆 Weekly Prep Plan</p>
            <ol className="space-y-2">
              {placement?.preparation_plan?.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300 py-1.5 border-b border-white/5 last:border-0">
                  <span className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-black flex items-center justify-center shrink-0 border border-indigo-500/30 mt-0.5">{i + 1}</span>
                  <span className="leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </Card>

          {/* Canteen */}
          <Card title="🍔 Canteen Predictor" badge={`${canteen?.crowd_percentage}% full`}>
            <p className="font-bold text-lg mb-1 flex items-center gap-2">
              {canteen?.crowd_percentage > 70 ? '🟥' : canteen?.crowd_percentage > 40 ? '🟨' : '🟩'} {canteen?.status}
            </p>
            <p className="text-gray-400 text-sm mb-4">{canteen?.suggestion}</p>
            
            {canteen?.forecast?.length > 0 && <>
              <div className="flex gap-2 mb-5 h-20 items-end">
                {canteen.forecast.map((f, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                  <span className="absolute -top-6 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition">{f.crowd_pct}%</span>
                  <div className={`w-full max-w-[20px] rounded-t-sm transition-all duration-500
                    ${f.level === "high" ? "bg-red-500" : f.level === "medium" ? "bg-amber-500" : "bg-green-500"}`} 
                    style={{height: `${Math.max(f.crowd_pct * 0.8, 8)}px`}} />
                  <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-tighter">{f.hour}</p>
                </div>
              ))}</div>
            </>}
            
            <div className="bg-black/30 rounded-lg p-1 border border-white/5">
              {canteen?.menu?.slice(0,3).map((m, i) => (
                <div key={i} className="flex justify-between items-center p-2 text-sm border-b border-white/5 last:border-0">
                  <span>{m.item} {m.tag && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded ml-2">{m.tag}</span>}</span>
                  <span className="text-green-400 font-bold">{m.price}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Faculty Updates */}
          <Card title="👨‍🏫 Faculty Broadcasts">
            <div className="space-y-3 custom-scrollbar max-h-64 overflow-y-auto">
              {faculty?.announcements?.map((a, i) => (
                <div key={i} className={`p-3 rounded-lg border-l-4 bg-white/5 transition hover:bg-white/10
                  ${a.priority === "high" ? "border-red-500" : a.priority === "medium" ? "border-amber-500" : "border-blue-500"}`}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    {a.subject}
                    {a.priority === "high" && <span className="text-red-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> URGENT</span>}
                  </p>
                  <p className="text-sm text-gray-200 leading-snug">{a.message}</p>
                </div>
              ))}
            </div>
          </Card>

        </main>
      </div>

    </div>
  );
}

function Card({ title, badge, children, className="" }) {
  return (
    <div className={`bg-[rgba(15,23,42,0.85)] border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 flex flex-col shadow-xl ${className}`}>
      <div className="flex justify-between items-center px-5 py-4 border-b border-white/5 bg-white/[0.02]">
        <h3 className="font-bold text-[15px]">{title}</h3>
        {badge != null && <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold tracking-wide border border-blue-500/30">{badge}</span>}
      </div>
      <div className="p-5 flex-1">{children}</div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="text-center p-2 rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-white/10 transition">
      <span className="block text-xl font-black text-cyan-400 drop-shadow-md">{value ?? "-"}</span>
      <span className="block text-[9px] text-gray-500 uppercase tracking-widest mt-1 font-bold">{label}</span>
    </div>
  );
}
