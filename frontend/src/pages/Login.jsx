import { useState } from "react";
import api from "../api/api";
import CardSwap, { Card } from "../components/ui/CardSwap";

const cards = [
  { id: "01", title: "Profit & Loss Tracking", description: "Monthly & yearly financial insights. Track every rupee spent and earned." },
  { id: "02", title: "Cloth Stock Management", description: "Manage fabric meters, dealer reports, and low-stock alerts automatically." },
  { id: "03", title: "Customer Measurements", description: "Store detailed VIP measurements, religion-wise categories, and order history." },
  { id: "04", title: "Payment Management", description: "Track customer-wise payments, bills, advance amounts, and pending status." },
];

import ForgotPasswordModal from "../components/ForgotPasswordModal";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);


  const handleLogin = async (e) => {
    e?.preventDefault();
    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.access_token);
      window.location.href = "/dashboard";
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 font-sans flex items-center overflow-hidden relative selection:bg-blue-500/30">

      {/* Abstract Background Shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-200/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-[-20%] right-[10%] w-[40vw] h-[40vw] bg-cyan-200/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-8 lg:px-12 items-center relative z-10">

        {/* LEFT — LOGIN FORM */}
        <div className="flex justify-start w-full">
          <div className="w-full max-w-[440px] backdrop-blur-2xl bg-white/70 rounded-[3rem] p-10 md:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/60 relative overflow-hidden group">

            {/* Subtle gloss effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="mb-10">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tighter">
                  Welcome Back
                </h1>
                <p className="text-slate-500 text-lg font-medium">
                  Enter your details to access SilaiBook.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="group/input">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within/input:text-blue-600 transition-colors">
                    Username
                  </label>
                  <input
                    className="w-full px-6 py-4 bg-white/60 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-300 font-medium"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="group/input">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within/input:text-blue-600 transition-colors">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      className="w-full px-6 py-4 bg-white/60 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-300 font-medium font-sans text-lg tracking-tight"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-sm font-semibold text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 active:scale-[0.98] mt-2 relative overflow-hidden"
                >
                  <span className="relative z-10">Sign In</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT — HIDDEN (Layout Spacer for CardSwap) */}
        <div className="hidden md:block" />
      </div>

      {/* FLOATING CARDS — BOTTOM RIGHT */}
      <div className="hidden md:block absolute bottom-0 right-0 z-0 pointer-events-none translate-y-0 translate-x-0 pr-12 pb-12">
        <div className="pointer-events-auto">
          <CardSwap
            width={640}
            height={420}
            cardDistance={60}
            verticalDistance={70}
            delay={5000}
            pauseOnHover={false}
          >
            {cards.map((c, i) => (
              <Card key={i} className="bg-white border border-slate-100 overflow-hidden shadow-[0_30px_60px_-10px_rgba(0,0,0,0.15)]">
                {/* Header matching your reference image */}
                <div className="bg-[#0f172a] px-8 py-6 flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    <span className="text-[11px] text-slate-300 font-mono uppercase tracking-widest font-semibold opacity-80">
                      SilaiBook V1
                    </span>
                  </div>
                  <div className="flex gap-1.5 opacity-30">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>

                {/* Content area [cite: 3] */}
                <div className="p-12 relative h-full flex flex-col justify-start bg-gradient-to-b from-white to-slate-50/50">
                  <h3 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter leading-[1.1]">{c.title}</h3>
                  <p className="text-slate-500 text-xl leading-relaxed font-medium max-w-[90%]">{c.description}</p>

                  {/* Large Watermark Number */}
                  <div className="absolute bottom-14 left-6 text-[140px] font-black text-slate-900/5 select-none italic tracking-tighter leading-none">
                    {c.id}
                  </div>
                </div>
              </Card>
            ))}
          </CardSwap>
        </div>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}