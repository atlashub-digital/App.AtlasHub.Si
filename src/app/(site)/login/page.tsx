import { whatsappLink } from "@/config/site";
import { features } from "@/lib/availability";
import { Unavailable } from "@/components/Unavailable";

export const metadata = { title: "Portal do cliente · AtlasHub" };

export default function Login() {
  if (!features(process.env).portal)
    return (
      <main className="mx-auto max-w-[560px] px-4 pb-24 pt-12 sm:px-8 md:pt-20">
        <Unavailable
          eyebrow="Portal do cliente"
          title="O portal do cliente está a mudar para o AtlasHub Workspaces."
          text="O acesso de clientes ainda não está aberto nesta versão. Se já é cliente ou piloto da AtlasHub, a equipa dá-lhe acesso e acompanhamento pelo WhatsApp oficial."
          whatsapp={whatsappLink("Olá, equipa AtlasHub. Preciso de acesso ao portal do cliente.")}
          cta="Pedir acesso pelo WhatsApp"
        />
      </main>
    );
  return (
    <main className="mx-auto max-w-[480px] px-4 pb-24 pt-12 sm:px-8 md:pt-20">
      <div className="ah-card ah-bar ah-rise p-6 sm:p-8">
        <p className="ah-eyebrow">Portal do cliente</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em]">Entrar</h1>
        <p className="mt-2 text-mute">Consulte a atividade do serviço gerido pela AtlasHub.</p>
        <form action="/api/session" method="post" className="mt-6 flex flex-col gap-5">
          <label className="block text-sm font-medium text-mute">
            Email
            <input required name="email" type="email" autoComplete="email" className="ah-input" />
          </label>
          <label className="block text-sm font-medium text-mute">
            Palavra-passe
            <input required name="password" type="password" autoComplete="current-password" className="ah-input" />
          </label>
          <button className="ah-btn w-full" type="submit">Entrar</button>
        </form>
        <p className="mt-5 text-xs text-dim">O acesso requer uma conta autorizada no Supabase. Dados fictícios em staging.</p>
        <a
          href={whatsappLink("Olá, equipa AtlasHub. Preciso de acesso ao portal do cliente.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-cyan3 hover:text-fg"
        >
          Ainda não tem acesso? Fale connosco ↗
        </a>
      </div>
    </main>
  );
}
