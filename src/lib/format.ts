// Formatação de números das métricas (pt-BR, como as clínicas e lojas do Brasil leem).
export function formatValue(value: number, unit: string | undefined): string {
  const n = Math.round(value).toLocaleString("pt-BR");
  switch (unit) {
    case "BRL":
      return `R$ ${n}`;
    case "%":
      return `${n} %`;
    case "min":
      return `${n} min`;
    case "h":
      return `${n} h`;
    default:
      return n;
  }
}
