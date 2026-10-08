import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Login Supabase ainda não configurado neste ambiente" }, { status: 503 });
  const form = await request.formData();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }), cache: "no-store", signal: AbortSignal.timeout(10000) });
  if (!response.ok) return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  const session = await response.json();
  const result = NextResponse.redirect(new URL("/portal", request.url), 303);
  result.cookies.set("waas_session", session.access_token, { httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "strict", maxAge: Math.min(session.expires_in, 3600), path: "/" });
  return result;
}
