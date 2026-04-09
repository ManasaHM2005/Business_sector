import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCoordinator, fetchContext } from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [mcpLogs, setMcpLogs] = useState([]);
  const [connected, setConnected] = useState(true);
  const navigate = useNavigate();

  const userName = localStorage.getItem("user_name") || "Student";
  const userPic = localStorage.getItem("user_pic") || "";
  const avatar = userName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!localStorage.getItem("user_id")) { navigate("/login"); return; }
    if (localStorage.getItem("user_role") === "faculty") { navigate("/faculty"); return; }
    load();
    const id = setInterval(load, 5000); // 5s is more stable for production-feel
    return () => clearInterval(id);
  }, []);

  const load = async () => {
    try { 
      const d = await fetchCoordinator(); 
      setData(d); 
      setConnected(true); 
      if (d.student?.student?.profile_pic) localStorage.setItem("user_pic", d.student.student.profile_pic);
      
      const ctx = await fetchContext();
      if(ctx.history) {
        // Show all recent agent actions, prioritizing Faculty
        const recentLogs = ctx.history.slice(-5).reverse();
        setMcpLogs(recentLogs);
      }
    }
    catch (e) { 
      setConnected(false); 
      console.error("Dashboard Load Error:", e);
      // If primary data is missing, we need to show at least a basic state or error
      if (!data) {
        setData({ student: { student: { name: userName } }, summary: "System offline. Reconnecting...", cross_insights: [] });
      }
    }
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 overflow-hidden flex items-center justify-center text-white font-bold shadow-md">
              {userPic ? <img src={userPic} alt="P" className="w-full h-full object-cover" /> : avatar}
            </div>
            <button onClick={logout} className="text-xs text-gray-400 border border-white/10 px-2 py-1 rounded hover:text-red-400 transition ml-2">Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 px-6 pb-6 max-w-[1600px] mx-auto w-full">

        {/* Top: AI Summary & Live MCP Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          
          <div className="lg:col-span-3 p-6 rounded-[2rem] bg-[#0d1526]/80 border border-purple-500/20 backdrop-blur-3xl relative overflow-hidden group shadow-2xl shadow-purple-500/5 transition-all hover:border-purple-500/40">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
            <div className="flex items-start gap-5 relative z-10">
              <div className="relative">
                <span className="text-4xl drop-shadow-[0_0_15px_rgba(168,85,247,0.6)] animate-pulse inline-block">🧠</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full blur-[2px] animate-ping opacity-50"></div>
              </div>
              <div className="flex-1">
                <header className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] italic">Neural Analysis Active</p>
                  <span className="text-[8px] font-bold text-gray-500 tracking-widest">v4.2.0-STABLE</span>
                </header>
                <p className="text-sm font-medium leading-relaxed text-gray-100/90 tracking-tight font-sans selection:bg-purple-500/30">
                  {summary}
                </p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none"></div>
          </div>

          <div className="lg:col-span-1 p-4 rounded-xl bg-black/40 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] relative overflow-hidden flex flex-col justify-start min-h-[160px]">
            <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-[pulse_2s_infinite]"></div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span> Live MCP Overrides (Agents)
              </span>
              <span className="text-[8px] opacity-40">REAL-TIME</span>
            </p>
            {mcpLogs.length === 0 ? <p className="text-xs text-gray-500 italic">Listening for agent signals...</p> : null}
            <div className="space-y-2 overflow-y-auto max-h-[120px] pr-1 custom-scrollbar">
              {mcpLogs.map((log, i) => (
                <div key={i} className={`text-[10px] leading-tight p-2 rounded border-l-2 transition-all duration-500 animate-[slideIn_0.3s]
                  ${log.agent === "FacultyAgent" ? "border-purple-500 bg-purple-500/5 text-purple-200" : 
                    log.agent === "CanteenAgent" ? "border-orange-500 bg-orange-500/5 text-orange-200" :
                    log.agent === "PlacementAgent" ? "border-indigo-500 bg-indigo-500/5 text-indigo-200" :
                    "border-blue-500 bg-blue-500/5 text-blue-200"}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black uppercase text-[8px] opacity-60 tracking-tighter">{log.agent}</span>
                    <span className="text-[7px] opacity-40">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <span className="font-semibold text-white/90">{log.action}:</span> {log.details}
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
            <div className="flex gap-4 items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
                <div className="w-full h-full rounded-full bg-[#0a0e1a] flex items-center justify-center overflow-hidden border-2 border-white/10">
                  {userPic || s.profile_pic ? <img src={userPic || s.profile_pic} className="w-full h-full object-cover" /> : <span className="text-2xl font-black">{avatar}</span>}
                </div>
              </div>
              <div>
                <h4 className="text-xl font-extrabold tracking-tight">{s.name}</h4>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">{s.major} • USN: {s.usn || "N/A"}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.skills?.split(",").map((sk, i) => (
                    <span key={i} className="text-[8px] font-black px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md uppercase">
                      {sk.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center hover:bg-white/5 transition-colors">
                <span className="text-2xl font-black text-cyan-400">{s.attendance}%</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Average Attendance</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center hover:bg-white/5 transition-colors">
                <span className="text-2xl font-black text-purple-400">{s.cgpa}</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Current CGPA</span>
              </div>
            </div>
          </Card>

          {/* Academic Records (Real-World Subject Tracking) */}
          <Card title="📊 Academic Ledger" badge={`${student?.subject_attendance?.length || 0} subjects`}>
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {student?.subject_attendance?.length > 0 ? (
                student.subject_attendance.map((sub, i) => (
                  <div key={i} className="group cursor-default">
                    <div className="flex justify-between items-end mb-1.5 px-1">
                      <div>
                        <span className="text-xs font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">{sub.subject}</span>
                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">Current Health: {sub.attendance_pct < 75 ? "Warning" : "Optimal"}</p>
                      </div>
                      <span className={`text-xs font-black ${sub.attendance_pct < 75 ? 'text-red-500' : 'text-cyan-400'}`}>
                        {sub.attendance_pct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${sub.attendance_pct < 75 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-cyan-600 to-blue-400'}`}
                        style={{ width: `${sub.attendance_pct}%` }}
                      >
                         <div className="w-full h-full bg-white/20 animate-[shimmer_2s_infinite]"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <div className="text-3xl mb-2 opacity-20">📀</div>
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Awaiting Neural Link</p>
                  <p className="text-[10px] text-gray-700 mt-1 italic italic">Ask faculty to sync subject records</p>
                </div>
              )}
            </div>
          </Card>

          {/* Smart Alerts */}
          <Card title="⚠️ Smart Alerts" badge={student?.alerts?.length}>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {student?.alerts?.map((a, i) => (
                <div key={i} className={`flex items-start p-3 rounded-lg text-sm border-l-4 transition-all duration-300 hover:translate-x-1
                  ${a.type === "danger" ? "bg-red-500/10 border-red-500 text-red-100" :
                    a.type === "warning" ? "bg-amber-500/10 border-amber-500 text-amber-100" :
                    a.type === "success" ? "bg-green-500/10 border-green-500 text-green-100" :
                    "bg-blue-500/10 border-blue-500 text-blue-100"}`}>
                  <span className="text-lg mt-0.5">{a.icon}</span><span className="leading-snug">{a.message}</span>
                </div>
              ))}
              {student?.alerts?.length === 0 && <p className="text-gray-500 text-xs italic py-4 text-center">No risk detected. Systems normal.</p>}
            </div>
          </Card>

          {/* Pending Tasks */}
          <Card title="✍️ Pending Assignments" badge={stats.pending}>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {student?.pending_tasks?.length > 0 ? (
                student.pending_tasks.map((t, i) => (
                  <div key={i} className={`p-3 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition`}>
                    <div>
                      <p className="font-bold text-sm group-hover:text-blue-400 transition">{t.task_name}</p>
                      <p className="text-[10px] text-gray-500">{t.subject} • Due {t.due_date}</p>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded border
                      ${t.priority === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                      {t.priority}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
                  <p className="text-gray-500 text-sm">All cleared! 🎉</p>
                </div>
              )}
            </div>
          </Card>

          {/* Today's Schedule */}
          <Card title="📅 Today's Schedule">
            {student?.today_classes?.length > 0 ? (
              <div className="space-y-2">
                {student.today_classes.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 text-sm hover:bg-white/10 transition group">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-cyan-400 w-20">{c.time}</span>
                      <span className="font-medium group-hover:text-cyan-300 transition">{c.subject}</span>
                    </div>
                    <span className="text-gray-400 text-[10px] px-2 py-1 bg-black/30 rounded border border-white/5">{c.room}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-white/10 rounded-xl">
                <p className="text-gray-500 text-sm italic mb-2">No classes scheduled for today 🎉</p>
                <p className="text-[10px] text-gray-600">Faculty can push live overrides to your schedule.</p>
              </div>
            )}
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
            
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">📋 All Campus Drives</p>
            {placement?.all_drives?.length > 0 ? (
              placement.all_drives.map((d, i) => {
                const isEligible = placement.eligible_drives?.some(ed => ed.company === d.company && ed.role === d.role);
                return (
                  <div key={i} className={`flex justify-between items-center p-3 rounded-lg border mb-2 text-sm transition-all duration-300
                    ${isEligible 
                      ? "bg-gradient-to-r from-indigo-500/10 to-transparent border-indigo-500/30 hover:border-indigo-500/60 shadow-lg shadow-indigo-500/5" 
                      : "bg-white/[0.02] border-white/5 opacity-60 hover:opacity-100 hover:border-white/10"}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">{d.company}</p>
                        {isEligible ? (
                          <span className="text-[9px] font-black bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30 animate-pulse">MATCHED</span>
                        ) : (
                          <span className="text-[9px] font-black bg-gray-500/20 text-gray-500 px-1.5 py-0.5 rounded border border-white/10">PENDING REQUIREMENTS</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs">{d.role}</p>
                      <p className="text-gray-500 text-[10px] mt-1 italic">Required: {d.skills_required || "None"}</p>
                      <p className="text-gray-500 text-xs mt-1 text-[11px]">📅 {d.date} • Threshold: {d.min_cgpa} CGPA</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-black text-lg px-2 py-1 rounded ${isEligible ? "text-green-400 bg-green-400/10" : "text-gray-600 bg-white/5"}`}>{d.package}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
                <p className="text-gray-500 text-sm italic">No active recruitment cycles reported</p>
              </div>
            )}

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
