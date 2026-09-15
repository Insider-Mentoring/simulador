"use client";

import { useRef } from "react";

export function numeroParaTextoBR(n: number): string {
  return String(n).replace(".", ",");
}

function limpar(texto: string): string {
  let vistoVirgula = false;
  let out = "";
  for (const ch of texto) {
    if (ch >= "0" && ch <= "9") {
      out += ch;
    } else if (ch === "," && !vistoVirgula) {
      out += ",";
      vistoVirgula = true;
    }
  }
  const [intPart, decPart] = out.split(",");
  const intSemZerosEsquerda = intPart.replace(/^0+(?=\d)/, "");
  return decPart !== undefined ? `${intSemZerosEsquerda},${decPart}` : intSemZerosEsquerda;
}

function formatar(raw: string): string {
  const limpo = limpar(raw);
  if (limpo === "") return "R$ 0";
  const [intPart, decPart] = limpo.split(",");
  const intFormatado = (intPart || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decPart !== undefined ? `R$ ${intFormatado},${decPart}` : `R$ ${intFormatado}`;
}

function contarDigitosAte(texto: string, pos: number): number {
  let count = 0;
  for (let i = 0; i < pos && i < texto.length; i++) {
    if (/[0-9,]/.test(texto[i])) count++;
  }
  return count;
}

function posicaoParaDigitos(texto: string, alvo: number): number {
  let count = 0;
  for (let i = 0; i < texto.length; i++) {
    if (/[0-9,]/.test(texto[i])) {
      count += 1;
      if (count === alvo) return i + 1;
    }
  }
  return texto.length;
}

export default function CurrencyInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (raw: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const displayed = formatar(value);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    const novoTexto = el.value;
    const posCursor = el.selectionStart ?? novoTexto.length;
    const digitosAntes = contarDigitosAte(novoTexto, posCursor);
    const limpo = limpar(novoTexto);
    onChange(limpo);

    requestAnimationFrame(() => {
      if (!ref.current) return;
      const novoDisplay = formatar(limpo);
      const novaPos = posicaoParaDigitos(novoDisplay, digitosAntes);
      ref.current.setSelectionRange(novaPos, novaPos);
    });
  }

  return (
    <input
      ref={ref}
      type="text"
      inputMode="decimal"
      value={displayed}
      onChange={handleChange}
      className={className}
    />
  );
}
