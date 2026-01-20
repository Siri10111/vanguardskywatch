"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const login = async () => {
    setMsg("Logging in…");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMsg(error.message);
    window.location.href = "/dashboard";
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/30 p-6">
        <h1 className="text-2xl font-bold">SkyWatch</h1>
        <p className="text-sm opacity-75 mt-1">Business access only</p>

        <div className="mt-4 space-y-3">
          <input className="w-full rounded-xl p-3 bg-black/40 border border-white/10"
            placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full rounded-xl p-3 bg-black/40 border border-white/10"
            placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="w-full rounded-xl p-3 bg-white text-black font-semibold" onClick={login}>
            Sign in
          </button>
          <div className="text-sm opacity-80">{msg}</div>
        </div>
      </div>
    </main>
  );
}
