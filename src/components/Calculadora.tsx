"use client";

import { useEffect, useRef, useState } from "react";

const SIMBOLOS = ["+", "-", "×", "÷", "(", ")"] as const;
type Simbolo = (typeof SIMBOLOS)[number];

function ehSimbolo(t: string | undefined): t is Simbolo {
  return t !== undefined && (SIMBOLOS as readonly string[]).includes(t);
}

function precisaDeMais(t: string | undefined): boolean {
  return t === "+" || t === "-" || t === "×" || t === "÷" || t === "(";
}

function ehOperadorBinario(t: string | undefined): boolean {
  return t === "+" || t === "-" || t === "×" || t === "÷";
}

function paraNumero(tok: string): number {
  return Number(tok.replace(",", "."));
}

function formatarNumeroToken(tok: string): string {
  const negativo = tok.startsWith("-");
  const semSinal = negativo ? tok.slice(1) : tok;
  const [intPart, decPart] = semSinal.split(",");
  const intFmt = (intPart || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const base = decPart !== undefined ? `${intFmt},${decPart}` : intFmt;
  return negativo ? `-${base}` : base;
}

function formatarResultado(valor: number): string {
  if (Number.isNaN(valor)) return "Erro";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 8 }).format(valor);
}

// Avalia uma expressao em tokens respeitando precedencia (x/÷ antes de +/-) e parenteses.
function avaliar(tokens: string[]): number {
  let pos = 0;

  function parsePrimario(): number {
    if (tokens[pos] === "(") {
      pos++;
      const v = parseExpressao();
      if (tokens[pos] === ")") pos++;
      return v;
    }
    const t = tokens[pos];
    pos++;
    if (t === undefined || ehSimbolo(t)) return NaN;
    return paraNumero(t);
  }

  function parseTermo(): number {
    let v = parsePrimario();
    while (tokens[pos] === "×" || tokens[pos] === "÷") {
      const op = tokens[pos];
      pos++;
      const rhs = parsePrimario();
      v = op === "×" ? v * rhs : rhs === 0 ? NaN : v / rhs;
    }
    return v;
  }

  function parseExpressao(): number {
    let v = parseTermo();
    while (tokens[pos] === "+" || tokens[pos] === "-") {
      const op = tokens[pos];
      pos++;
      const rhs = parseTermo();
      v = op === "+" ? v + rhs : v - rhs;
    }
    return v;
  }

  if (tokens.length === 0) return NaN;
  const v = parseExpressao();
  return pos === tokens.length ? v : NaN;
}

// Valor a mostrar no visor grande: o numero em edicao, o resultado do ultimo
// grupo fechado "(...)" ou o numero anterior mais proximo.
function valorAtualExibido(tokens: string[]): string {
  if (tokens.length === 0) return "0";
  const ultimo = tokens[tokens.length - 1];
  if (!ehSimbolo(ultimo)) return formatarNumeroToken(ultimo);
  if (ultimo === ")") {
    let nivel = 0;
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (tokens[i] === ")") nivel++;
      else if (tokens[i] === "(") {
        nivel--;
        if (nivel === 0) return formatarResultado(avaliar(tokens.slice(i + 1, tokens.length - 1)));
      }
    }
    return "0";
  }
  return valorAtualExibido(tokens.slice(0, -1));
}

export default function Calculadora() {
  const [tokens, setTokens] = useState<string[]>([]);
  const [resultado, setResultado] = useState<string | null>(null);
  const [expressaoCongelada, setExpressaoCongelada] = useState<string[]>([]);

  const ultimo = tokens[tokens.length - 1];
  const editandoNumero = tokens.length > 0 && !ehSimbolo(ultimo);

  function limpar() {
    setTokens([]);
    setResultado(null);
    setExpressaoCongelada([]);
  }

  function inputDigito(d: string) {
    if (resultado !== null) {
      setResultado(null);
      setTokens([d]);
      return;
    }
    if (tokens.length === 0 || ehSimbolo(ultimo)) {
      setTokens((t) => [...t, d]);
      return;
    }
    setTokens((t) => {
      const copia = [...t];
      const atual = copia[copia.length - 1];
      copia[copia.length - 1] = atual === "0" ? d : atual === "-0" ? "-" + d : atual + d;
      return copia;
    });
  }

  function inputPonto() {
    if (resultado !== null) {
      setResultado(null);
      setTokens(["0,"]);
      return;
    }
    if (tokens.length === 0 || ehSimbolo(ultimo)) {
      setTokens((t) => [...t, "0,"]);
      return;
    }
    setTokens((t) => {
      const copia = [...t];
      const atual = copia[copia.length - 1];
      if (!atual.includes(",")) copia[copia.length - 1] = atual + ",";
      return copia;
    });
  }

  function apagar() {
    if (resultado !== null) {
      limpar();
      return;
    }
    if (tokens.length === 0) return;
    if (ehSimbolo(ultimo)) {
      setTokens((t) => t.slice(0, -1));
      return;
    }
    if (ultimo.length <= 1 || (ultimo.startsWith("-") && ultimo.length <= 2)) {
      setTokens((t) => (t.length === 1 ? [] : [...t.slice(0, -1), "0"]));
      return;
    }
    setTokens((t) => [...t.slice(0, -1), ultimo.slice(0, -1)]);
  }

  function alternarSinal() {
    if (resultado !== null) {
      setResultado((r) => (r && r !== "Erro" ? (r.startsWith("-") ? r.slice(1) : "-" + r) : r));
      return;
    }
    if (!editandoNumero || ultimo === "0") return;
    setTokens((t) => {
      const copia = [...t];
      const atual = copia[copia.length - 1];
      copia[copia.length - 1] = atual.startsWith("-") ? atual.slice(1) : "-" + atual;
      return copia;
    });
  }

  function pressPercentual() {
    if (resultado !== null) {
      const v = paraNumero(resultado.replace(/\./g, "")) / 100;
      setResultado(formatarResultado(v));
      return;
    }
    if (!editandoNumero) return;
    const valorAtual = paraNumero(ultimo);
    const opAnterior = tokens[tokens.length - 2];
    let novoValor: number;
    if (opAnterior === "+" || opAnterior === "-") {
      const base = avaliar(tokens.slice(0, -2));
      novoValor = Number.isNaN(base) ? valorAtual / 100 : base * (valorAtual / 100);
    } else {
      novoValor = valorAtual / 100;
    }
    setTokens((t) => [...t.slice(0, -1), String(novoValor).replace(".", ",")]);
  }

  function pressOperador(op: Exclude<Simbolo, "(" | ")">) {
    if (resultado !== null) {
      setTokens([resultado.replace(/\./g, ""), op]);
      setResultado(null);
      return;
    }
    if (tokens.length === 0) {
      if (op === "-") setTokens(["0", "-"]);
      return;
    }
    if (ultimo === "(") {
      if (op === "-") setTokens((t) => [...t, "0", "-"]);
      return;
    }
    if (ehOperadorBinario(ultimo)) {
      setTokens((t) => [...t.slice(0, -1), op]);
      return;
    }
    setTokens((t) => [...t, op]);
  }

  function abrirParenteses() {
    if (resultado !== null) {
      setResultado(null);
      setTokens(["("]);
      return;
    }
    if (tokens.length === 0 || ehSimbolo(ultimo)) {
      setTokens((t) => [...t, "("]);
    }
  }

  function fecharParenteses() {
    if (resultado !== null || !editandoNumero) return;
    const abertos = tokens.filter((t) => t === "(").length;
    const fechados = tokens.filter((t) => t === ")").length;
    if (abertos <= fechados) return;
    setTokens((t) => [...t, ")"]);
  }

  function pressIgual() {
    if (tokens.length === 0 || precisaDeMais(ultimo)) return;
    const abertos = tokens.filter((t) => t === "(").length;
    const fechados = tokens.filter((t) => t === ")").length;
    const balanceados = [...tokens, ...Array(Math.max(0, abertos - fechados)).fill(")")];
    const valor = avaliar(balanceados);
    setExpressaoCongelada(balanceados);
    setResultado(formatarResultado(valor));
  }

  const handlersRef = useRef({
    inputDigito,
    inputPonto,
    pressOperador,
    pressPercentual,
    abrirParenteses,
    fecharParenteses,
    pressIgual,
    apagar,
    limpar,
  });
  useEffect(() => {
    handlersRef.current = {
      inputDigito,
      inputPonto,
      pressOperador,
      pressPercentual,
      abrirParenteses,
      fecharParenteses,
      pressIgual,
      apagar,
      limpar,
    };
  });

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      const h = handlersRef.current;
      if (e.key >= "0" && e.key <= "9") {
        h.inputDigito(e.key);
        return;
      }
      switch (e.key) {
        case ".":
        case ",":
          h.inputPonto();
          break;
        case "+":
          h.pressOperador("+");
          break;
        case "-":
          h.pressOperador("-");
          break;
        case "*":
        case "x":
        case "X":
          h.pressOperador("×");
          break;
        case "/":
          e.preventDefault();
          h.pressOperador("÷");
          break;
        case "%":
          h.pressPercentual();
          break;
        case "(":
          h.abrirParenteses();
          break;
        case ")":
          h.fecharParenteses();
          break;
        case "Enter":
        case "=":
          e.preventDefault();
          h.pressIgual();
          break;
        case "Backspace":
          h.apagar();
          break;
        case "Escape":
        case "Delete":
          h.limpar();
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, []);

  const tokensExibidos = resultado !== null ? expressaoCongelada : tokens;
  const linhaPequena = editandoNumero && resultado === null ? tokensExibidos.slice(0, -1) : tokensExibidos;
  const numeroGrande = resultado !== null ? resultado : valorAtualExibido(tokens);

  const botaoBase = "rounded-xl py-4 text-lg font-semibold transition-colors";
  const botaoNumero = `${botaoBase} bg-[#f0f2f8] text-[#1B2A6B] hover:bg-[#e4e7f2]`;
  const botaoOperador = `${botaoBase} bg-[#1B2A6B] text-white hover:bg-[#152057]`;
  const botaoAcao = `${botaoBase} bg-gray-200 text-[#1B2A6B] hover:bg-gray-300`;

  return (
    <div>
      <div className="mb-4 rounded-xl bg-[#f7f8fc] px-4 py-5 text-right">
        <div className="h-5 truncate text-sm text-gray-400">
          {linhaPequena.map((t) => (ehSimbolo(t) ? t : formatarNumeroToken(t))).join(" ")}
        </div>
        <div className="truncate text-3xl font-bold text-[#1B2A6B]">{numeroGrande}</div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button type="button" onClick={abrirParenteses} className={`${botaoAcao} col-span-2`}>
          (
        </button>
        <button type="button" onClick={fecharParenteses} className={`${botaoAcao} col-span-2`}>
          )
        </button>

        <button type="button" onClick={limpar} className={botaoAcao}>
          C
        </button>
        <button type="button" onClick={apagar} className={botaoAcao}>
          ⌫
        </button>
        <button type="button" onClick={alternarSinal} className={botaoAcao}>
          ±
        </button>
        <button type="button" onClick={pressPercentual} className={botaoAcao}>
          %
        </button>

        <button type="button" onClick={() => inputDigito("7")} className={botaoNumero}>
          7
        </button>
        <button type="button" onClick={() => inputDigito("8")} className={botaoNumero}>
          8
        </button>
        <button type="button" onClick={() => inputDigito("9")} className={botaoNumero}>
          9
        </button>
        <button type="button" onClick={() => pressOperador("÷")} className={botaoOperador}>
          ÷
        </button>

        <button type="button" onClick={() => inputDigito("4")} className={botaoNumero}>
          4
        </button>
        <button type="button" onClick={() => inputDigito("5")} className={botaoNumero}>
          5
        </button>
        <button type="button" onClick={() => inputDigito("6")} className={botaoNumero}>
          6
        </button>
        <button type="button" onClick={() => pressOperador("×")} className={botaoOperador}>
          ×
        </button>

        <button type="button" onClick={() => inputDigito("1")} className={botaoNumero}>
          1
        </button>
        <button type="button" onClick={() => inputDigito("2")} className={botaoNumero}>
          2
        </button>
        <button type="button" onClick={() => inputDigito("3")} className={botaoNumero}>
          3
        </button>
        <button type="button" onClick={() => pressOperador("-")} className={botaoOperador}>
          -
        </button>

        <button type="button" onClick={() => inputDigito("0")} className={`${botaoNumero} col-span-2`}>
          0
        </button>
        <button type="button" onClick={inputPonto} className={botaoNumero}>
          ,
        </button>
        <button type="button" onClick={() => pressOperador("+")} className={botaoOperador}>
          +
        </button>

        <button
          type="button"
          onClick={pressIgual}
          className={`${botaoBase} col-span-4 bg-[#E8522A] text-white hover:bg-[#d1461f]`}
        >
          =
        </button>
      </div>
    </div>
  );
}
