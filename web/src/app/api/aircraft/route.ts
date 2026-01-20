import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return NextResponse.json({ error: "missing_token" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: u, error } = await supabase.auth.getUser(token);
  if (error || !u.user) return NextResponse.json({ error: "invalid_token" }, { status: 401 });

  // TODO: replace this stub with your real data source fetch
  const url = new URL(req.url);
  const lamin = url.searchParams.get("lamin");
  const lomin = url.searchParams.get("lomin");
  const lamax = url.searchParams.get("lamax");
  const lomax = url.searchParams.get("lomax");

  // Demo response so the UI works end-to-end:
  return NextResponse.json({
    ok: true,
    bbox: { lamin, lomin, lamax, lomax },
    aircraft: [
      { callsign: "TEST01", icao24: "abc123", lat: 41.88, lon: -87.63, alt: 12000 },
      { callsign: "TEST02", icao24: "def456", lat: 41.98, lon: -87.70, alt: 18000 }
    ],
  });
}
