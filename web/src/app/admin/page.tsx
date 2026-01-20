"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function AdminPage() {
  const supabase = supabaseBrowser();
  const [msg, setMsg] = useState("");
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { window.location.href = "/"; return; }
      await loadProfiles();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfiles = async () => {
    setMsg("Loading users…");
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) { setMsg("No token."); return; }

    const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` }});
    const json = await res.json();
    if (!res.ok) { setMsg(json.error || "error"); return; }

    setProfiles(json.users || []);
    setMsg(`Loaded ${json.users?.length || 0} users`);
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin</h1>
          <div className="text-sm opacity-70">Manage org users</div>
        </div>
        <a className="rounded-xl border border-white/15 px-4 py-2" href="/dashboard">Back</a>
      </div>

      <div className="mt-3 text-sm opacity-80">{msg}</div>

      <div className="mt-4 rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left p-3">User ID</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.user_id} className="border-t border-white/10">
                <td className="p-3">{p.user_id}</td>
                <td className="p-3">{p.role}</td>
                <td className="p-3">{String(p.enabled)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
