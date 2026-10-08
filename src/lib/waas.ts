import "server-only";
import { cookies } from "next/headers";
export function apiUrl() {
  const value = process.env.WAAS_API_URL || "http://127.0.0.1:4000";
  const url = new URL(value);
  if (url.protocol !== "https:" && !["127.0.0.1", "localhost"].includes(url.hostname)) throw new Error("API must use HTTPS");
  return value;
}
export async function waas(path: string, tenant: string) {
  const token = (await cookies()).get("waas_session")?.value;
  if (!token) return null;
  const response = await fetch(`${apiUrl()}${path}?tenant=${encodeURIComponent(tenant)}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}
