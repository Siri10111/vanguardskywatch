import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // allow public routes
  if (path === "/" || path.startsWith("/api/bootstrap")) return NextResponse.next();

  // Supabase stores auth in cookies when using helpers; we’re not using helper packages here.
  // Minimal protection: allow pages to load; they will redirect client-side if not logged in.
  // (If you want strict server-side auth, we can add @supabase/ssr next.)
  return NextResponse.next();
}
