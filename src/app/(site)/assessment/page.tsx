import { apiUrl } from "@/lib/waas";
import { whatsappLink } from "@/config/site";
import { features } from "@/lib/availability";
import { Unavailable } from "@/components/Unavailable";
import { redirect } from "next/navigation";

export const metadata = { title: "Assessment · AtlasHub" };

const WA = whatsappLink("Olá, equipa AtlasHub. Gostaria de marcar um AI Business Assessment.");

export default async function Assessment({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  async function submit(form: FormData) {
    "use server";
    let ok = false;
    try {
      const response = await fetch(`${apiUrl()}/v1/assessments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business: form.get("business"), need: form.get("need"), consent: form.get("consent") === "on" }), signal: AbortSignal.timeout(10000) });
      ok = response.ok;
    } catch {
      ok = false;
    }
    redirect(ok ? "/assessment?sent=1" : "/assessment?error=1");
  }
  const { sent, error } = await searchParams;
  const available = features(process.env).assessment;
  return (
    <main className="mx-auto grid max-w-[1180px] gap-8 px-4 pb-24 pt-12 sm:px-8 md:pt-16 lg:grid-cols-[1fr_1.1fr]">
      <section className="ah-rise">
        <p className="ah-eyebrow">AI Business Assessment</p>
        <h1 className="mt-4 text-[clamp(36px,4.6vw,60px)] font-extrabold leading-[1.04] tracking-[-0.035em]">
          Desenhar a missão <span className="ah-accent">com a Clara.</span>
        </h1>
        <p className="mt-5 max-w-[520px] text-lg text-mute">
          A Clara ajuda a definir o serviço que a AtlasHub irá operar e supervisionar. O assessment não ativa um colaborador nem define um preço.
        </p>
        <ol className="mt-8 flex flex-col gap-4">
          {[
            ["Diagnóstico", "Entendemos o processo, os dados e o que deve mudar."],
            ["Escopo e limites", "Definimos o que o agente faz e o que fica sempre com pessoas."],
            ["Proposta", "Recebe a modalidade recomendada e o valor definido no assessment."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4">
              <span className="ah-step" data-state="done">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div className="font-semibold">{t}</div>
                <div className="text-sm text-dim">{d}</div>
              </div>
            </li>
          ))}
        </ol>
        <a href={WA} target="_blank" rel="noopener noreferrer" className="ah-btn-ghost mt-8">
          Prefere falar já? WhatsApp ↗
        </a>
      </section>

      <section className="ah-card ah-bar ah-rise p-6 sm:p-8" aria-label="Pedido de assessment" style={{ animationDelay: "0.1s" }}>
        {!available ? (
          <Unavailable
            eyebrow="Pedido online em preparação"
            title="Marque o assessment pelo WhatsApp."
            text="O registo online de pedidos ainda não está ligado nesta versão. A equipa AtlasHub responde pelo WhatsApp oficial e agenda o assessment consigo."
            whatsapp={WA}
            cta="Marcar pelo WhatsApp"
            bare
          />
        ) : error ? (
          <Unavailable
            eyebrow="Pedido não registado"
            title="Não foi possível registar o pedido."
            text="O serviço não respondeu. Nada foi guardado. Pode tentar mais tarde ou falar já com a equipa pelo WhatsApp."
            whatsapp={WA}
            cta="Falar pelo WhatsApp"
            bare
          />
        ) : sent ? (
          <div role="status" className="flex flex-col gap-4">
            <span className="ah-chip w-fit text-ok"><span className="ah-dot" aria-hidden="true" />Pedido registado</span>
            <h2 className="text-2xl font-bold">Obrigado. A equipa AtlasHub vai rever o pedido.</h2>
            <p className="text-mute">Nenhuma integração foi ativada.</p>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="ah-btn w-fit">Acompanhar pelo WhatsApp ↗</a>
          </div>
        ) : (
          <form action={submit} className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold">Pedir assessment</h2>
            <label className="block text-sm font-medium text-mute">
              Empresa
              <input name="business" required maxLength={120} className="ah-input" autoComplete="organization" />
            </label>
            <label className="block text-sm font-medium text-mute">
              Necessidade administrativa
              <textarea name="need" required maxLength={1000} rows={5} className="ah-input resize-y" />
            </label>
            <p className="rounded-lg border border-[#6b4a12]/70 bg-warn/5 px-4 py-3 text-sm text-[#ecc37e]">
              Não inclua dados clínicos, credenciais ou dados de pacientes. Utilize dados fictícios em staging.
            </p>
            <label className="flex gap-3 text-sm text-mute">
              <input name="consent" type="checkbox" required className="ah-check" />
              Autorizo o registo deste pedido para avaliação pela AtlasHub.
            </label>
            <button className="ah-btn w-full sm:w-fit">Solicitar assessment →</button>
          </form>
        )}
      </section>
    </main>
  );
}
