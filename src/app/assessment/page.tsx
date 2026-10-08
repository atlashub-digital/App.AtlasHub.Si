import { apiUrl } from "@/lib/waas";
import { redirect } from "next/navigation";
export default async function Assessment({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  async function submit(form: FormData) {
    "use server";
    const response = await fetch(`${apiUrl()}/v1/assessments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business: form.get("business"), need: form.get("need"), consent: form.get("consent") === "on" }), signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Não foi possível registar o pedido");
    redirect("/assessment?sent=1");
  }
  return <main className="mx-auto max-w-xl space-y-6 p-8"><h1 className="text-3xl font-bold">Assessment AtlasHub</h1><p>A Clara ajuda a definir o serviço que a AtlasHub irá operar e supervisionar. O assessment não ativa um colaborador nem define um preço.</p>{(await searchParams).sent ? <p role="status">Pedido registado. Nenhuma integração foi ativada.</p> : <form action={submit} className="space-y-4"><label className="block">Empresa<input name="business" required maxLength={120} className="block w-full p-3 text-black" /></label><label className="block">Necessidade administrativa<textarea name="need" required maxLength={1000} className="block w-full p-3 text-black" /></label><p>Não inclua dados clínicos, credenciais ou dados de pacientes. Utilize dados fictícios em staging.</p><label className="block"><input name="consent" type="checkbox" required /> Autorizo o registo deste pedido para avaliação pela AtlasHub.</label><button className="border p-3">Solicitar assessment</button></form>}</main>;
}
