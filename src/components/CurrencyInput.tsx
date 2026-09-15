"use client";

import { useState } from "react";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const parseValor = (texto: string) => Number(texto.replace(/\./g, "").replace(",", "."));

export default function CurrencyInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (raw: string) => void;
  className?: string;
}) {
  const [focado, setFocado] = useState(false);

  const numero = parseValor(value);
  const exibicao = focado || value === "" || Number.isNaN(numero) ? value : formatBRL(numero);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={exibicao}
      onFocus={() => setFocado(true)}
      onBlur={() => setFocado(false)}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  );
}
