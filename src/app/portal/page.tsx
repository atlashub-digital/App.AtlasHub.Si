import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { waas, apiUrl } from "@/lib/waas";
export default async function Portal({ searchParams }: { searchParams: Promise<{ tenant?: string }> }) {
  if (!(await cookies()).get("waas_session")) redirect("/login");
  const tenant = (await searchParams).tenant || "";
  if (!tenant) return <main className="mx-auto max-w-xl space-y-4 p-8"><h1>Selecionar empresa</h1><form><label>Identificador da empresa<input name="tenant" required className="block rounded border p-3 text-black" /></label><button className="border p-3">Consultar</button></form></main>;
  const [runs, approvals, usage] = await Promise.all([waas("/v1/runs", tenant), waas("/v1/approvals", tenant), waas("/v1/usage", tenant)]);
  if (!runs || !approvals || !usage) return <main className="p-8"><h1>Acesso indisponível</h1><p>A sessão expirou ou não tem autorização para esta empresa.</p><a href="/login">Entrar novamente</a></main>;
  async function decide(form: FormData) {
    "use server";
    const session = (await cookies()).get("waas_session")?.value;
    const response = await fetch(`${apiUrl()}/v1/approvals/${encodeURIComponent(String(form.get("approval")))}/decide`, { method: "POST", headers: { Authorization: `Bearer ${session}`, "Content-Type": "application/json" }, body: JSON.stringify({ tenant, decision: form.get("decision") }), cache: "no-store" });
    if (!response.ok) throw new Error("Decisão rejeitada; confirme as permissões e a validade da tarefa");
    redirect(`/portal?tenant=${encodeURIComponent(tenant)}`);
  }
  return <main className="mx-auto max-w-5xl space-y-6 p-8"><h1 className="text-3xl font-bold">Serviço gerido · Atividade</h1><p>Ambiente de staging com dados sintéticos. Custos apresentados como estimativas; sem canal real.</p><h2 className="text-xl">Execuções</h2><ul>{runs.map((run: { id: string; state: string }) => <li key={run.id}>{run.id} · {run.state}</li>)}</ul><h2 className="text-xl">Aprovações humanas</h2>{approvals.map((approval: { id: string; state: string; requestedAction: string }) => <form key={approval.id} action={decide} className="space-x-4 border p-4"><span>{approval.requestedAction} · {approval.state}</span><input type="hidden" name="approval" value={approval.id} />{approval.state === "pending" && <><button name="decision" value="approved" className="border p-3">Aprovar</button><button name="decision" value="rejected" className="border p-3">Rejeitar</button></>}</form>)}<h2 className="text-xl">Consumo</h2><p>{usage.length} ações administrativas registadas. Estimativa de custo externo: R$ 0 no calendário local; custo de infraestrutura não calculado.</p><form action="/api/logout" method="post"><button className="border p-3">Terminar sessão</button></form></main>;
}
