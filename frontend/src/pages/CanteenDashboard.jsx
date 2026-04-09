import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addCanteenMenu, updateCanteenCrowd, fetchContext } from "../api";

export default function CanteenDashboard() {
  const [menu, setMenu] = useState({ item: "", price: "", tag: "🔥 Popular" });
  const [crowd, setCrowd] = useState(50);
  const [mcpLogs, setMcpLogs] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userName = localStorage.getItem("user_name") || "Manager";
  const avatar = userName.charAt(0).toUpperCase();

  const loadMcp = async () => {
    try {
      const data = await fetchContext();
      if (data.history) setMcpLogs(data.history.slice(-10).reverse());
    } catch (e) {}
  };

  useEffect(() => {
    if (localStorage.getItem("user_role") !== "canteen") navigate("/login");
    loadMcp();
    const id = setInterval(loadMcp, 3000);
    return () => clearInterval(id);
  }, []);

  const handleAddMenu = async () => {
    if (!menu.item || !menu.price) return setMsg("❌ Item name and price required.");
    setLoading(true);
    await addCanteenMenu(menu);
    setMsg(`✅ Added ${menu.item} to live menu!`);
    setMenu({ item: "", price: "", tag: "🔥 Popular" });
    setLoading(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleUpdateCrowd = async () => {
    setLoading(true);
    await updateCanteenCrowd(crowd);
    setMsg(`✅ Live crowd level updated to ${crowd}%`);
    setLoading(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const logout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 p-6 flex flex-col items-center font-sans tracking-tight">
      
      {/* Dynamic Navbar */}
      <nav className="w-full max-w-6xl flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 py-4 shadow-xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xl font-black shadow-lg border border-white/20">
            {avatar}
          </div>
          <div>
            <span className="block text-lg font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent uppercase">Canteen Control Hub</span>
            <span className="block text-xs text-gray-400">Owner Terminal: {userName}</span>
          </div>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 border border-white/10 px-4 py-2 rounded-lg hover:text-red-400 transition">Logout</button>
      </nav>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Management Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Menu Form */}
            <section className="bg-gray-900/60 p-6 rounded-3xl border border-white/10 backdrop-blur-sm relative overflow-hidden">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2">🍔 Live Menu Entry</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Item Title</label>
                  <input value={menu.item} onChange={e => setMenu({...menu, item: e.target.value})} placeholder="e.g. Special Fried Rice"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:border-orange-500 outline-none transition" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Price</label>
                    <input value={menu.price} onChange={e => setMenu({...menu, price: e.target.value})} placeholder="₹80"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:border-orange-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Status</label>
                    <select value={menu.tag} onChange={e => setMenu({...menu, tag: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none font-bold text-xs">
                      <option value="">Standard</option>
                      <option value="🔥 Popular">Popular</option>
                      <option value="🌟 Chef's Special">Chef's Special</option>
                      <option value="🌿 Veg">Veg Only</option>
                      <option value="☕ Refreshing">Refreshing</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleAddMenu} disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-500/10 hover:opacity-90 transition mt-2">
                  Publish to Dashboard
                </button>
              </div>
            </section>

            {/* Crowd Slider */}
            <section className="bg-gray-900/60 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2">👥 Crowd Management</h2>
              <div className="text-center mb-6">
                <div className="text-6xl font-black bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent mb-2">{crowd}%</div>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Live Saturation Level</p>
              </div>
              <input type="range" min="0" max="100" value={crowd} onChange={e => setCrowd(e.target.value)}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500 mb-8" />
              
              <button onClick={handleUpdateCrowd} disabled={loading}
                className="w-full py-3.5 bg-white text-black rounded-xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition">
                SYNC REALITY
              </button>
            </section>

          </div>

          {msg && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-center text-orange-400 font-bold text-sm animate-bounce">
              {msg}
            </div>
          )}
        </div>

        {/* Live Feed */}
        <div className="space-y-6">
          <div className="bg-black/40 border border-white/10 rounded-3xl p-6 shadow-2xl h-[645px] flex flex-col overflow-hidden">
            <h3 className="text-gray-400 font-bold mb-5 flex items-center justify-between uppercase tracking-widest text-[10px]">
              <span>Real-time Operations log</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span> Live</span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {mcpLogs.length === 0 ? <p className="text-gray-600 text-[10px] italic">Awaiting logs...</p> : null}
              {mcpLogs.map((log, i) => (
                <div key={i} className={`p-4 rounded-xl border text-[10px] leading-relaxed transition-all animate-[slideIn_0.3s]
                  ${log.agent === "CanteenAgent" ? "bg-orange-500/10 border-orange-500/20 text-orange-100" : "bg-white/5 border-white/5 text-gray-500"}`}>
                  <div className="flex justify-between items-center mb-1 font-black uppercase text-[8px] opacity-60">
                    <span>{log.agent}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  </div>
                  <span className="font-bold">{log.action}:</span> {log.details}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
