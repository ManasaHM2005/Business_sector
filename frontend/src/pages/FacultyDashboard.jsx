import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { facultyAddTask, facultyAddSchedule, facultyUpdateAttendance, facultyUpdateCgpa, facultyUpdateCanteen, fetchContext } from "../api";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("user_name") || "Faculty";
  const avatar = userName.charAt(0).toUpperCase();

  const [mcpLogs, setMcpLogs] = useState([]);
  
  // Get today's day name to fix schedule sync
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // Forms state
  const [taskForm, setTaskForm] = useState({ student_id: 1, task_name: "", subject: "", due_date: "Tomorrow", priority: "high" });
  const [scheduleForm, setScheduleForm] = useState({ student_id: 1, day: todayName, subject: "", time: "10:00 AM", room: "Room 101" });
  
  const [attendance, setAttendance] = useState({ student_id: 1, val: 80.0 });
  const [cgpa, setCgpa] = useState({ student_id: 1, val: 8.5 });
  const [canteen, setCanteen] = useState({ val: 85 });
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const loadMcp = async () => {
    try {
      const data = await fetchContext();
      if (data.history) {
        setMcpLogs(data.history.slice(-10).reverse());
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (localStorage.getItem("user_role") !== "faculty") {
      navigate("/");
    }
    loadMcp();
    const id = setInterval(loadMcp, 3000);
    return () => clearInterval(id);
  }, []);

  const runSubmit = async (fn, successMsg) => {
    setLoading(true); setMsg("");
    try {
      await fn();
      setMsg(`✅ ${successMsg}`);
      loadMcp();
    } catch (e) { setMsg("❌ Action failed."); }
    setLoading(false);
  };

  const handleTask = () => runSubmit(() => facultyAddTask(Number(taskForm.student_id), taskForm.task_name, taskForm.subject, taskForm.due_date, taskForm.priority), "Task deployed to Student Dashboard!");
  const handleSchedule = () => runSubmit(() => facultyAddSchedule(Number(scheduleForm.student_id), scheduleForm.day, scheduleForm.subject, scheduleForm.time, scheduleForm.room), "Schedule override pushed!");
  const handleAttendance = () => runSubmit(() => facultyUpdateAttendance(Number(attendance.student_id), Number(attendance.val)), "Attendance updated and MCP synced!");
  const handleCgpa = () => runSubmit(() => facultyUpdateCgpa(Number(cgpa.student_id), Number(cgpa.val)), "Monthly record/CGPA updated and MCP synced!");
  const handleCanteen = () => runSubmit(() => facultyUpdateCanteen(Number(canteen.val)), "Canteen crowd simulation pushed!");

  const logout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div className="min-h-screen text-gray-100 p-6 flex flex-col items-center">
      
      {/* Navbar with Profile Icon */}
      <nav className="w-full max-w-5xl flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 py-4 shadow-xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold shadow-lg border border-white/20">
            {avatar}
          </div>
          <div>
            <span className="block text-lg font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Faculty Control Center</span>
            <span className="block text-xs text-gray-400">Welcome back, Prof. {userName}</span>
          </div>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 border border-white/10 px-4 py-2 rounded-lg hover:text-red-400 hover:border-red-500/30 transition">Logout</button>
      </nav>

      {msg && <div className="w-full max-w-5xl mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center animate-[fadeIn_0.3s]">{msg}</div>}

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TASK FORM */}
          <div className="bg-gray-900/60 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">✍️ Push Assignment Override</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Student ID</label>
                <input type="number" value={taskForm.student_id} onChange={e => setTaskForm({...taskForm, student_id: e.target.value})} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Subject</label>
                <input type="text" value={taskForm.subject} onChange={e => setTaskForm({...taskForm, subject: e.target.value})} placeholder="e.g. AI & ML" className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Task Title</label>
                <input type="text" value={taskForm.task_name} onChange={e => setTaskForm({...taskForm, task_name: e.target.value})} placeholder="Hackathon Project Submission" className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Due Date</label>
                <input type="text" value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} placeholder="Today / Tomorrow" className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Priority</label>
                <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white">
                  <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                </select>
              </div>
            </div>
            <button onClick={handleTask} disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition">Push Assignment to Student</button>
          </div>

          {/* SCHEDULE FORM */}
          <div className="bg-gray-900/60 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📅 Force Schedule Override</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Student ID</label>
                <input type="number" value={scheduleForm.student_id} onChange={e => setScheduleForm({...scheduleForm, student_id: e.target.value})} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Day / Date</label>
                <input type="text" value={scheduleForm.day} onChange={e => setScheduleForm({...scheduleForm, day: e.target.value})} placeholder={todayName} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white text-indigo-300 font-bold" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Subject</label>
                <input type="text" value={scheduleForm.subject} onChange={e => setScheduleForm({...scheduleForm, subject: e.target.value})} placeholder="e.g. Operating Systems" className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Time</label>
                <input type="text" value={scheduleForm.time} onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})} placeholder="10:00 AM" className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Room</label>
                <input type="text" value={scheduleForm.room} onChange={e => setScheduleForm({...scheduleForm, room: e.target.value})} placeholder="Room 401" className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white" />
              </div>
            </div>
            <button onClick={handleSchedule} disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition">Push Schedule Override</button>
          </div>

          {/* QUICK UPDATES: Attendance, CGPA, Canteen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
            <div className="bg-gray-900/60 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                <h3 className="font-bold text-sm mb-3">✅ Edit Attendance</h3>
                <input type="number" placeholder="Student ID" value={attendance.student_id} onChange={e=>setAttendance({...attendance, student_id: e.target.value})} className="w-full px-3 py-1.5 mb-2 bg-black/40 border border-white/10 rounded text-sm text-white" />
                <input type="number" placeholder="Percentage %" value={attendance.val} onChange={e=>setAttendance({...attendance, val: e.target.value})} className="w-full px-3 py-1.5 mb-3 bg-black/40 border border-white/10 rounded text-sm text-white" />
                <button onClick={handleAttendance} className="w-full py-1.5 bg-green-600/80 rounded text-xs font-bold hover:bg-green-500 transition">Update</button>
            </div>

            <div className="bg-gray-900/60 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                <h3 className="font-bold text-sm mb-3">📊 Edit CGPA</h3>
                <input type="number" placeholder="Student ID" value={cgpa.student_id} onChange={e=>setCgpa({...cgpa, student_id: e.target.value})} className="w-full px-3 py-1.5 mb-2 bg-black/40 border border-white/10 rounded text-sm text-white" />
                <input type="number" placeholder="CGPA" value={cgpa.val} onChange={e=>setCgpa({...cgpa, val: e.target.value})} className="w-full px-3 py-1.5 mb-3 bg-black/40 border border-white/10 rounded text-sm text-white" />
                <button onClick={handleCgpa} className="w-full py-1.5 bg-blue-600/80 rounded text-xs font-bold hover:bg-blue-500 transition">Update</button>
            </div>

            <div className="bg-gray-900/60 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                <h3 className="font-bold text-sm mb-3">🍔 Overide Canteen</h3>
                <label className="block text-[10px] text-gray-400 mb-1">Global Override (All Students)</label>
                <input type="number" placeholder="Crowd %" value={canteen.val} onChange={e=>setCanteen({...canteen, val: e.target.value})} className="w-full px-3 py-1.5 mb-3 bg-black/40 border border-white/10 rounded text-sm text-white mt-8" />
                <button onClick={handleCanteen} className="w-full py-1.5 bg-orange-600/80 rounded text-xs font-bold hover:bg-orange-500 transition">Simulate Crowd</button>
            </div>

          </div>

        </div>

        {/* Right Col: MCP Live Tracker */}
        <div className="bg-black/40 border border-blue-500/30 rounded-2xl p-5 shadow-[0_0_15px_rgba(59,130,246,0.1)] relative overflow-hidden flex flex-col h-[760px]">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-[pulse_2s_infinite]"></div>
          <h3 className="text-blue-400 font-bold mb-4 flex items-center justify-between uppercase tracking-wider text-sm">
            <span>🔗 MCP Context Log</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span> Live</span>
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {mcpLogs.length === 0 ? <p className="text-gray-500 text-sm italic">Waiting for MCP traffic...</p> : null}
            {mcpLogs.map((log, i) => (
              <div key={i} className={`p-3 rounded border text-xs leading-relaxed
                ${log.agent === "FacultyAgent" && log.severity ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/10 text-gray-400"}`}>
                <span className={`font-bold ${log.agent === "FacultyAgent" ? "text-purple-400" : "text-blue-400"}`}>[{log.agent}]</span>
                <span className="text-gray-500 ml-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <div className="mt-1 font-mono">{log.action}: {log.details}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
