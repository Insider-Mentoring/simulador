"use client";

import { useState } from "react";
import { PLANOS, CONFIG_PADRAO, type ConfigPrecos, type Plano } from "@/lib/pricing";
import { salvarConfig, ehConfigPadrao } from "@/lib/config";
import CurrencyInput, { numeroParaTextoBR } from "@/components/CurrencyInput";

const PLANO_ORDEM: Plano[] = ["individual", "dupla", "trio"];

const parseValor = (texto: string) => Number(texto.replace(/\./g, "").replace(",", "."));

function numeroParaPercentualTexto(fracao: number): string {
  const percentual = Math.round(fracao * 100 * 1e6) / 1e6;
  return String(percentual).replace(".", ",");
}

export default function Configuracoes({
  config,
  onConfigChange,
}: {
  config: ConfigPrecos;
  onConfigChange: (config: ConfigPrecos) => void;
}) {
  const [taxaInput, setTaxaInput] = useState(numeroParaPercentualTexto(config.taxaDesconto));
  const [valorCheioInput, setValorCheioInput] = useState<Record<Plano, string>>({
    individual: numeroParaTextoBR(config.valorCheio.individual),
    dupla: numeroParaTextoBR(config.valorCheio.dupla),
    trio: numeroParaTextoBR(config.valorCheio.trio),
  });
  const [salvo, setSalvo] = useState(false);

  function salvar() {
    const novaConfig: ConfigPrecos = {
      taxaDesconto: (parseValor(taxaInput) || 0) / 100,
      valorCheio: {
        individual: parseValor(valorCheioInput.individual) || config.valorCheio.individual,
        dupla: parseValor(valorCheioInput.dupla) || config.valorCheio.dupla,
        trio: parseValor(valorCheioInput.trio) || config.valorCheio.trio,
      },
    };
    salvarConfig(novaConfig);
    onConfigChange(novaConfig);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  function restaurarPadrao() {
    setTaxaInput(numeroParaPercentualTexto(CONFIG_PADRAO.taxaDesconto));
    setValorCheioInput({
      individual: numeroParaTextoBR(CONFIG_PADRAO.valorCheio.individual),
      dupla: numeroParaTextoBR(CONFIG_PADRAO.valorCheio.dupla),
      trio: numeroParaTextoBR(CONFIG_PADRAO.valorCheio.trio),
    });
    salvarConfig(CONFIG_PADRAO);
    onConfigChange(CONFIG_PADRAO);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  return (
    <div>
      <p className="mb-4 text-xs text-gray-500">
        Esses valores só afetam entradas fora da tabela oficial (calculadas na hora). A tabela
        oficial (múltiplos de mil) continua fixa, do jeito que foi transcrita.
      </p>

      <label className="block mb-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Percentual de desconto
        </span>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={taxaInput}
            onChange={(e) => setTaxaInput(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-lg font-semibold text-[#1B2A6B] focus:outline-none focus:ring-2 focus:ring-[#1B2A6B]/30"
          />
          <span className="text-lg font-semibold text-gray-400">%</span>
        </div>
      </label>

      {PLANO_ORDEM.map((plano) => (
        <label className="block mb-4" key={plano}>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Valor cheio - {PLANOS[plano].label}
          </span>
          <CurrencyInput
            value={valorCheioInput[plano]}
            onChange={(raw) => setValorCheioInput((prev) => ({ ...prev, [plano]: raw }))}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-lg font-semibold text-[#1B2A6B] focus:outline-none focus:ring-2 focus:ring-[#1B2A6B]/30"
          />
        </label>
      ))}

      <p className="mb-4 text-[11px] text-gray-400">
        {ehConfigPadrao(config) ? "Usando os valores padrão." : "Usando valores personalizados."}
      </p>

      <button
        type="button"
        onClick={salvar}
        className="w-full rounded-full bg-[#E8522A] py-3 text-sm font-bold text-white mb-3"
      >
        {salvo ? "Salvo!" : "Salvar"}
      </button>
      <button
        type="button"
        onClick={restaurarPadrao}
        className="w-full rounded-full border border-[#1B2A6B]/20 py-3 text-sm font-semibold text-[#1B2A6B]"
      >
        Restaurar padrão
      </button>
    </div>
  );
}
