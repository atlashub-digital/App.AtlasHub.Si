import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { waas, apiUrl } from "@/lib/waas";
import { features } from "@/lib/availability";

export const metadata = { title: "Portal do cliente · AtlasHub" };

const shell = "mx-auto flex max-w-[1180px] flex-col gap-6 px-4 pb-24 pt-12 sm:px-8 md:pt-16";

export default async function Portal({ searchParams }: { searchParams: Promise<{ tenant?: string }> }) {
  // Without Core + auth configured there is no portal to show: /login explains and points to WhatsApp.
  if (!features(process.env).portal || !(await cookies()).get("waas_session")) redirect("/login");
  const tenant = (await searchParams).tenant || "";
  if (!tenant)
    return (
      <main className={shell}>
        <div className="ah-card ah-bar ah-rise mx-auto w-full max-w-[520px] p-6 sm:p-8">
          <p className="ah-eyebrow">Portal do cliente</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em]">Selecionar empresa</h1>
          <form className="mt-6 flex flex-col gap-5">
            <label className="block text-sm font-medium text-mute">
              Identificador da empresa
              <input name="tenant" required className="ah-input" />
            </label>
            <button className="ah-btn w-full">Consultar</button>
          </form>
        </div>
      </main>
    );
  const [runs, approvals, usage] = await Promise.all([waas("/v1/runs", tenant), waas("/v1/approvals", tenant), waas("/v1/usage", tenant)]);
  if (!runs || !approvals || !usage)
    return (
      <main className={shell}>
        <div className="ah-card ah-bar mx-auto w-full max-w-[520px] p-8">
          <h1 className="text-2xl font-bold">Acesso indisponível</h1>
          <p className="mt-2 text-mute">A sessão expirou ou não tem autorização para esta empresa.</p>
          <Link href="/login" className="ah-btn mt-6">Entrar novamente</Link>
        </div>
      </main>
    );
  async function decide(form: FormData) {
    "use server";
    const session = (await cookies()).get("waas_session")?.value;
    const response = await fetch(`${apiUrl()}/v1/approvals/${encodeURIComponent(String(form.get("approval")))}/decide`, { method: "POST", headers: { Authorization: `Bearer ${session}`, "Content-Type": "application/json" }, body: JSON.stringify({ tenant, decision: form.get("decision") }), cache: "no-store" });
    if (!response.ok) throw new Error("Decisão rejeitada; confirme as permissões e a validade da tarefa");
    redirect(`/portal?tenant=${encodeURIComponent(tenant)}`);
  }
  return (
    <main className={shell}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ah-eyebrow">Serviço gerido</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.035em]">Atividade</h1>
          <p className="mt-2 text-mute">Ambiente de staging com dados sintéticos. Custos apresentados como estimativas; sem canal real.</p>
        </div>
        <form action="/api/logout" method="post"><button className="ah-btn-quiet">Terminar sessão</button></form>
      </header>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="ah-card ah-bar p-6">
          <h2 className="text-xl font-bold">Execuções</h2>
          <ul className="mt-4 flex flex-col divide-y divide-line">
            {runs.map((run: { id: string; state: string }) => (
              <li key={run.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="font-mono text-mute">{run.id}</span>
                <span className="ah-chip text-cyan3">{run.state}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="ah-card ah-bar p-6">
          <h2 className="text-xl font-bold">Aprovações humanas</h2>
          <div className="mt-4 flex flex-col gap-3">
            {approvals.map((approval: { id: string; state: string; requestedAction: string }) => (
              <form key={approval.id} action={decide} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-panel2/60 p-4">
                <span className="grow text-sm">{approval.requestedAction} · <span className="text-dim">{approval.state}</span></span>
                <input type="hidden" name="approval" value={approval.id} />
                {approval.state === "pending" && (
                  <>
                    <button name="decision" value="approved" className="ah-btn">Aprovar</button>
                    <button name="decision" value="rejected" className="ah-btn-quiet">Rejeitar</button>
                  </>
                )}
              </form>
            ))}
          </div>
        </section>
      </div>
      <section className="ah-card ah-bar p-6">
        <h2 className="text-xl font-bold">Consumo</h2>
        <p className="mt-2 text-mute">{usage.length} ações administrativas registadas. Estimativa de custo externo: R$ 0 no calendário local; custo de infraestrutura não calculado.</p>
      </section>
    </main>
  );
}
