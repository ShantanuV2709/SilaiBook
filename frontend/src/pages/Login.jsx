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


  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.access_token);
      window.location.href = "/dashboard";
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex items-center overflow-hidden relative">
      {/* Background decoration to match SilaiBook aesthetic */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-32 px-12 items-center relative">

        {/* LEFT — LOGIN FORM */}
        <div className="flex justify-start z-20">
          <div className="w-full max-w-[420px] bg-white rounded-[40px] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-slate-100">
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Sign In</h1>
            <p className="text-slate-400 mb-10 text-lg">Manage your SilaiBook account.</p>

            {error && <p className="text-red-500 mb-4 font-semibold text-sm">{error}</p>}

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Username</label>
                <input
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all outline-none text-slate-900"
                  placeholder="admin_username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Password</label>
                <input
                  type="password"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all outline-none text-slate-900"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm text-slate-500 hover:text-slate-900 transition text-left"
              >
                Forgot password?
              </button>

              <button
                onClick={handleLogin}
                className="w-full bg-[#0f172a] text-white py-5 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl active:scale-[0.98] mt-4"
              >
                Login
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — THE CARDS */}
        <div className="hidden md:block">
          <CardSwap
            width={640}         // Enlarged Width
            height={420}        // Enlarged Height
            cardDistance={100}  // Spacing for the stack
            verticalDistance={40}
            skewAmount={7}      // Higher value makes the "opposite face" more visible
            delay={5000}
          >
            {cards.map((c, i) => (
              <Card key={i} className="bg-white border border-slate-100 overflow-hidden">
                {/* Header matching your reference image */}
                <div className="bg-[#0f172a] px-8 py-5 flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-[11px] text-slate-300 font-mono uppercase tracking-widest">
                      SilaiBook
                    </span>
                  </div>
                </div>

                {/* Content area [cite: 3] */}
                <div className="p-12 relative h-full flex flex-col justify-start">
                  <h3 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">{c.title}</h3>
                  <p className="text-slate-500 text-2xl leading-relaxed font-medium">{c.description}</p>

                  {/* Large Watermark Number */}
                  <div className="absolute bottom-[-10px] right-10 text-[200px] font-black text-black/6 select-none italic">
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