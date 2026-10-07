// Avaliador seguro das fórmulas de métricas dos packs.
// Port de atlas-agent-packs/lib/metrics.mjs: o comportamento TEM de ser idêntico
// (ver tests/metrics.test.ts). Só números, nomes de inputs/outputs, + - * / ( ) e round/min/max.
// Nunca usa eval: os packs são dados e não executam código no app.
import type { Metrics } from "./types";

type Token = { t: "num" | "id" | "op"; v: string | number };
type Ast =
  | { num: number }
  | { id: string }
  | { fn: string; args: Ast[] }
  | { op: "neg"; a: Ast }
  | { op: "+" | "-" | "*" | "/"; a: Ast; b: Ast };

const FUNCS: Record<string, (...n: number[]) => number> = {
  round: (n) => Math.round(n),
  min: Math.min,
  max: Math.max,
};

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  const re = /\s*(?:(\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|(.))/gy;
  let m: RegExpExecArray | null;
  while (re.lastIndex < src.length && (m = re.exec(src))) {
    if (m[1] !== undefined) tokens.push({ t: "num", v: Number(m[1]) });
    else if (m[2] !== undefined) tokens.push({ t: "id", v: m[2] });
    else if (m[3] !== undefined && m[3].trim()) {
      if (!"+-*/(),".includes(m[3])) throw new Error(`Carácter inválido na fórmula: "${m[3]}"`);
      tokens.push({ t: "op", v: m[3] });
    }
  }
  return tokens;
}

export function parse(src: string): Ast {
  const tk = tokenize(src);
  let i = 0;
  const peek = (): Token | undefined => tk[i];
  const eat = (v: string): void => {
    const t = tk[i];
    if (!t || t.v !== v) throw new Error(`Esperava "${v}" na fórmula "${src}"`);
    i++;
  };
  const expr = (): Ast => {
    let n = term();
    while (peek() && (peek()!.v === "+" || peek()!.v === "-")) {
      const op = tk[i++].v as "+" | "-";
      n = { op, a: n, b: term() };
    }
    return n;
  };
  const term = (): Ast => {
    let n = factor();
    while (peek() && (peek()!.v === "*" || peek()!.v === "/")) {
      const op = tk[i++].v as "*" | "/";
      n = { op, a: n, b: factor() };
    }
    return n;
  };
  const factor = (): Ast => {
    const t = tk[i++];
    if (!t) throw new Error(`Fórmula incompleta: "${src}"`);
    if (t.t === "num") return { num: t.v as number };
    if (t.v === "-") return { op: "neg", a: factor() };
    if (t.v === "(") {
      const n = expr();
      eat(")");
      return n;
    }
    if (t.t === "id") {
      const name = t.v as string;
      if (peek() && peek()!.v === "(") {
        if (!FUNCS[name]) throw new Error(`Função desconhecida: ${name}`);
        i++;
        const args = [expr()];
        while (peek() && peek()!.v === ",") {
          i++;
          args.push(expr());
        }
        eat(")");
        return { fn: name, args };
      }
      return { id: name };
    }
    throw new Error(`Token inesperado "${String(t.v)}" em "${src}"`);
  };
  const ast = expr();
  if (i < tk.length) throw new Error(`Sobra texto na fórmula "${src}"`);
  return ast;
}

function run(ast: Ast, scope: Record<string, number>): number {
  if ("num" in ast) return ast.num;
  if ("id" in ast) {
    if (!(ast.id in scope)) throw new Error(`Variável desconhecida: ${ast.id}`);
    return scope[ast.id];
  }
  if ("fn" in ast) return FUNCS[ast.fn](...ast.args.map((a) => run(a, scope)));
  if (ast.op === "neg") return -run(ast.a, scope);
  const a = run(ast.a, scope);
  const b = run(ast.b, scope);
  switch (ast.op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return b === 0 ? 0 : a / b;
  }
}

/**
 * Calcula as métricas de um pack.
 * Devolve inputs (já limitados a min/max) e outputs, pela ordem declarada.
 */
export function evaluateMetrics(
  metrics: Metrics,
  values: Record<string, number> = {},
): Record<string, number> {
  const scope: Record<string, number> = {};
  for (const inp of metrics.inputs) {
    const num = Number(values[inp.key] ?? inp.default);
    if (!Number.isFinite(num)) throw new Error(`Valor inválido para ${inp.key}`);
    scope[inp.key] = Math.min(inp.max ?? Infinity, Math.max(inp.min ?? -Infinity, num));
  }
  for (const out of metrics.outputs) scope[out.key] = run(parse(out.formula), scope);
  return scope;
}
