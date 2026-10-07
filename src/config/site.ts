// Configuração comercial do app. Sem segredos: tudo aqui é público no bundle.

/** WhatsApp da AtlasHub (o mesmo da landing atlashub.si). Sobrepor com NEXT_PUBLIC_WHATSAPP_NUMBER. */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5562991903462";

/**
 * Preços das modalidades. `null` = ainda não publicado: o app mostra
 * "Valor definido no AI Business Assessment" em vez de inventar um número.
 * Preencher quando os preços fixos forem aprovados (ver Decision Log).
 */
export const OFFER = {
  cloud: { priceLabel: null as string | null },
  onsite: { priceLabel: null as string | null },
};

export const PRICE_PENDING = "Valor definido no AI Business Assessment";

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
