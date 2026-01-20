"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Aircraft = { icao24?: string; callsign?: string; lat?: number; lon?: number; alt?: number };

export default function Dashboard() {
  const supabase = supabaseBrowser();
  const [userEmail, setUserEmail] = useState<string>("");
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/";
        return;
      }
      setUserEmail(data.user.email || "");
      await loadAircraft();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAircraft = async () => {
    setMsg("Loading aircraft…");
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) { setMsg("No session token. Re-login."); return; }

    // sample bbox
    const lamin = 33.9, lomin = -100.7, lamax = 48.9, lomax = -74.5;

    const res = await fetch(`/api/aircraft?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const json = await res.json();
    if (!res.ok) { setMsg(json.error || "aircraft error"); return; }

    setAircraft(json.aircraft || []);
    setMsg(`Loaded ${json.aircraft?.length || 0} aircraft`);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="text-sm opacity-70">Signed in as {userEmail}</div>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-white/15 px-4 py-2" onClick={loadAircraft}>Refresh</button>
          <a className="rounded-xl border border-white/15 px-4 py-2" href="/admin">Admin</a>
          <button className="rounded-xl bg-white text-black px-4 py-2 font-semibold" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="mt-4 text-sm opacity-80">{msg}</div>

      <div className="mt-4 rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left p-3">Callsign</th>
              <th className="text-left p-3">ICAO24</th>
              <th className="text-left p-3">Lat</th>
              <th className="text-left p-3">Lon</th>
              <th className="text-left p-3">Alt</th>
            </tr>
          </thead>
          <tbody>
            {aircraft.map((a, i) => (
              <tr key={i} className="border-t border-white/10">
                <td className="p-3">{a.callsign || "-"}</td>
                <td className="p-3">{a.icao24 || "-"}</td>
                <td className="p-3">{a.lat ?? "-"}</td>
                <td className="p-3">{a.lon ?? "-"}</td>
                <td className="p-3">{a.alt ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
