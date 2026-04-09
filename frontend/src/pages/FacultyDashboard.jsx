import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { facultyAddTask, facultyAddSchedule, facultyUpdateAttendance, fetchContext } from "../api";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("user_name") || "Faculty";
  const avatar = userName.charAt(0).toUpperCase();

  const [mcpLogs, setMcpLogs] = useState([]);
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // Forms state
  const [taskForm, setTaskForm] = useState({ student_id: 1, task_name: "", subject: "", due_date: "Tomorrow", priority: "high" });
  const [scheduleForm, setScheduleForm] = useState({ student_id: 1, day: todayName, subject: "", time: "10:00 AM", room: "Room 101" });
  const [attendance, setAttendance] = useState({ student_id: 1, val: 80.0, subject: "AI & ML" });
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const loadMcp = async () => {
    try {
      const data = await fetchContext();
      if (data.history) setMcpLogs(data.history.slice(-12).reverse());
    } catch (e) {}
  };

  useEffect(() => {
    if (localStorage.getItem("user_role") !== "faculty") navigate("/");
    loadMcp();
    const id = setInterval(loadMcp, 3000);
    return () => clearInterval(id);
  }, []);

  const runSubmit = async (fn, successMsg) => {
    setLoading(true); setMsg("");
    try {
      await fn();
      setMsg(`🚀 SUCCESS: ${successMsg}`);
      loadMcp();
    } catch (e) { setMsg("❌ SYSTEM ERROR: Transmission failed."); }
    setLoading(false);
    setTimeout(() => setMsg(""), 4000);
  };

  const handleTask = () => runSubmit(() => facultyAddTask(Number(taskForm.student_id), taskForm.task_name, taskForm.subject, taskForm.due_date, taskForm.priority), "Assignment Deployed");
  const handleSchedule = () => runSubmit(() => facultyAddSchedule(Number(scheduleForm.student_id), scheduleForm.day, scheduleForm.subject, scheduleForm.time, scheduleForm.room), "Schedule Rescheduled");
  const handleAttendance = () => runSubmit(() => facultyUpdateAttendance(Number(attendance.student_id), Number(attendance.val), attendance.subject), "Records Synchronized");

  return (
    <div className="min-h-screen bg-[#02050e] text-gray-100 p-6 flex flex-col items-center selection:bg-purple-500/30">
      
      {/* Cinematic Navbar */}
      <nav className="w-full max-w-6xl flex items-center justify-between backdrop-blur-2xl bg-[#0a0f1d]/80 border border-white/10 rounded-[2rem] px-8 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-10 transition-all duration-500 hover:border-purple-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-2xl font-black shadow-[0_0_20px_rgba(124,58,237,0.4)] border border-white/20 animate-pulse">
            {avatar}
          </div>
          <div>
            <span className="block text-xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent uppercase tracking-wider">Faculty Command Center</span>
            <span className="block text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Auth Level: Grade A | Prof. {userName}</span>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); navigate("/login"); }} 
          className="text-xs font-bold text-gray-400 border border-white/10 px-6 py-2 rounded-full hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-300 active:scale-95">
          Terminte Session
        </button>
      </nav>

      {msg && (
        <div className={`w-full max-w-6xl mb-6 p-4 rounded-2xl text-center text-sm font-bold border transition-all duration-500 animate-[slideDown_0.4s] 
          ${msg.includes('ERROR') ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'bg-purple-500/10 border-purple-500/40 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.1)]'}`}>
          {msg}
        </div>
      )}

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* OPERATIONAL FORMS (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ASSIGNMENT HUB */}
            <section className="bg-[#0b1121]/60 p-6 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-purple-500/10 transition-all"></div>
              <h2 className="text-lg font-black mb-6 flex items-center gap-3 text-purple-400 lowercase tracking-tighter italic">
                <span className="text-2xl font-normal not-italic px-3 py-1 bg-purple-500/10 rounded-xl">01</span> Assignment Deployment
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Target USN/ID" value={taskForm.student_id} onChange={v => setTaskForm({...taskForm, student_id: v})} type="number" />
                  <FormInput label="Academic Subject" value={taskForm.subject} onChange={v => setTaskForm({...taskForm, subject: v})} placeholder="e.g. AI Ethics" />
                </div>
                <FormInput label="Task Designation" value={taskForm.task_name} onChange={v => setTaskForm({...taskForm, task_name: v})} placeholder="Case Study Analysis" />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Deadline" value={taskForm.due_date} onChange={v => setTaskForm({...taskForm, due_date: v})} />
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Tactical Priority</label>
                    <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} 
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-purple-500 transition">
                      <option value="high">Critical</option><option value="medium">Standard</option><option value="low">Passive</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleTask} disabled={loading} className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-purple-900/20 hover:scale-[1.02] active:scale-95 transition-all">
                  Broadcast Task
                </button>
              </div>
            </section>

            {/* SCHEDULE HUB */}
            <section className="bg-[#0b1121]/60 p-6 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-500/10 transition-all"></div>
              <h2 className="text-lg font-black mb-6 flex items-center gap-3 text-blue-400 lowercase tracking-tighter italic">
                <span className="text-2xl font-normal not-italic px-3 py-1 bg-blue-500/10 rounded-xl">02</span> Schedule Synchronization
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Target ID" value={scheduleForm.student_id} onChange={v => setScheduleForm({...scheduleForm, student_id: v})} type="number" />
                  <FormInput label="Active Day" value={scheduleForm.day} onChange={v => setScheduleForm({...scheduleForm, day: v})} />
                </div>
                <FormInput label="Subject Context" value={scheduleForm.subject} onChange={v => setScheduleForm({...scheduleForm, subject: v})} placeholder="Systems Design" />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Time Slot" value={scheduleForm.time} onChange={v => setScheduleForm({...scheduleForm, time: v})} />
                  <FormInput label="Location Node" value={scheduleForm.room} onChange={v => setScheduleForm({...scheduleForm, room: v})} />
                </div>
                <button onClick={handleSchedule} disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-700 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all">
                  Force Update
                </button>
              </div>
            </section>
            
          </div>

          {/* ATTENDANCE HUB (HORIZONTAL) */}
          <section className="bg-[#0b1121]/60 p-8 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
            <h2 className="text-lg font-black mb-6 flex items-center gap-3 text-emerald-400 lowercase tracking-tighter italic">
              <span className="text-2xl font-normal not-italic px-3 py-1 bg-emerald-500/10 rounded-xl">03</span> Record Synchronization
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <FormInput label="Target ID" value={attendance.student_id} onChange={v => setAttendance({...attendance, student_id: v})} type="number" />
              <FormInput label="Subject" value={attendance.subject} onChange={v => setAttendance({...attendance, subject: v})} />
              <FormInput label="Attendance %" value={attendance.val} onChange={v => setAttendance({...attendance, val: v})} type="number" />
              <button onClick={handleAttendance} disabled={loading} className="w-full py-4 bg-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-500 transition-all active:scale-95">
                Sync Stats
              </button>
            </div>
          </section>

        </div>

        {/* MCP MONITOR (4 COLS) */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-[#050811] h-full rounded-[2.5rem] border border-white/5 shadow-[inset_0_2px_20px_rgba(0,0,0,0.8)] p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30 animate-[pulse_3s_infinite]"></div>
            
            <header className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Neural Network Feed</h3>
              <div className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
                <span className="text-[8px] font-bold text-purple-400 tracking-widest">LIVE DATA</span>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {mcpLogs.length === 0 && <p className="text-gray-700 text-xs italic text-center py-10">Listening for agent frequencies...</p>}
              {mcpLogs.map((log, i) => (
                <div key={i} className={`p-4 rounded-2xl border transition-all duration-500 animate-[slideUp_0.4s] 
                  ${log.agent === "FacultyAgent" ? "bg-purple-500/10 border-purple-500/30 text-purple-100" : "bg-white/[0.03] border-white/5 text-gray-500"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${log.agent === "FacultyAgent" ? "text-purple-400" : "text-gray-600"}`}>{log.agent}</span>
                    <span className="text-[8px] opacity-40 font-mono">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-medium">
                    <span className="opacity-60">{log.action}:</span> {log.details}
                  </p>
                </div>
              ))}
            </div>
            
            <footer className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] text-gray-600 font-bold uppercase tracking-widest">
              <span>Terminal Node: FC-882</span>
              <span>Context: {mcpLogs.length} Syncs</span>
            </footer>
          </div>
        </div>

      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, type="text", placeholder="" }) {
  return (
    <div className="flex-1">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-purple-500/50 focus:bg-black/60 transition placeholder:text-gray-700" />
    </div>
  );
}
