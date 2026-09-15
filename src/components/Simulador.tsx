"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { PLANOS, getBounds, simular, type Plano } from "@/lib/pricing";
import { gerarPixCobranca, type PixCobranca } from "@/lib/pix";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const PLANO_OPTIONS: Plano[] = ["individual", "dupla", "trio"];

export default function Simulador() {
  const [plano, setPlano] = useState<Plano>("trio");
  const [step, setStep] = useState<"calc" | "pagamento">("calc");
  const bounds = getBounds(plano);
  const [entradaInput, setEntradaInput] = useState(String(bounds.min));

  const resultado = useMemo(() => {
    const valor = Number(entradaInput.replace(/\./g, "").replace(",", ".")) || bounds.min;
    return simular(plano, valor);
  }, [plano, entradaInput, bounds.min]);

  function handlePlanoChange(novoPlano: Plano) {
    setPlano(novoPlano);
    setEntradaInput(String(getBounds(novoPlano).min));
  }

  const [pix, setPix] = useState<{ entrada: number; cobranca: PixCobranca } | null>(null);
  const [pixCopiado, setPixCopiado] = useState(false);

  useEffect(() => {
    if (step !== "pagamento") return;
    let cancelado = false;
    gerarPixCobranca(resultado.entrada).then((cobranca) => {
      if (!cancelado) setPix({ entrada: resultado.entrada, cobranca });
    });
    return () => {
      cancelado = true;
    };
  }, [step, resultado.entrada]);

  const pixAtual = pix?.entrada === resultado.entrada ? pix.cobranca : null;
  const pixCarregando = step === "pagamento" && !pixAtual;

  async function copiarCodigoPix() {
    if (!pixAtual) return;
    await navigator.clipboard.writeText(pixAtual.brCode);
    setPixCopiado(true);
    setTimeout(() => setPixCopiado(false), 2000);
  }

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-[20px] shadow-[0_12px_48px_rgba(27,42,107,0.18)]">
      <div className="leading-none">
        <Image
          src="/images/banner.jpg"
          alt="Insider Mentoring"
          width={933}
          height={268}
          className="w-full block"
          priority
        />
      </div>

      <div className="bg-white px-6 pb-6 pt-7">
        <div className="mb-5">
          <div className="text-2xl font-extrabold leading-tight tracking-tight text-[#1B2A6B]">
            Insider <span className="text-[#E8522A]">Mentoring</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {step === "calc" ? "Simulador de investimento" : "Pagamento"}
          </div>
        </div>

        {step === "calc" ? (
          <>
            <div className="flex gap-2 mb-5">
              {PLANO_OPTIONS.map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => handlePlanoChange(opcao)}
                  className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                    plano === opcao
                      ? "bg-[#1B2A6B] text-white"
                      : "bg-[#f0f2f8] text-[#1B2A6B]"
                  }`}
                >
                  {PLANOS[opcao].label}
                </button>
              ))}
            </div>

            <label className="block mb-5">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Valor de entrada
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={entradaInput}
                onChange={(e) => setEntradaInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-lg font-semibold text-[#1B2A6B] focus:outline-none focus:ring-2 focus:ring-[#1B2A6B]/30"
              />
              <span className="text-xs text-gray-400">
                Entre {formatBRL(bounds.min)} e {formatBRL(bounds.max)}
              </span>
            </label>

            <div className="rounded-xl bg-[#f7f8fc] divide-y divide-gray-200">
              <InfoRow label="Entrada considerada" value={formatBRL(resultado.entrada)} />
              <InfoRow label="Desconto aplicado" value={formatBRL(resultado.desconto)} />
              <InfoRow label="Valor remanescente" value={formatBRL(resultado.remanescente)} />
              <InfoRow
                label="Parcela do restante (9x)"
                value={formatBRL(resultado.parcelaRestante)}
              />
              <InfoRow
                label="Investimento total"
                value={formatBRL(resultado.investimentoTotal)}
                destaque
              />
            </div>
            <p className="mt-2 text-[11px] text-gray-400">
              {resultado.exato
                ? "Valores exatos da tabela oficial."
                : "Valor fora da tabela oficial — calculado com o percentual de desconto padrão (17,441%)."}
            </p>

            <button
              type="button"
              onClick={() => setStep("pagamento")}
              className="mt-5 w-full rounded-full bg-[#E8522A] py-3 text-sm font-bold text-white"
            >
              Ir para pagamento
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-5 h-[220px] w-[220px] mx-auto items-center">
              {pixAtual ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pixAtual.qrCodeImage}
                  alt="QR code PIX"
                  width={220}
                  height={220}
                  className="rounded-lg"
                />
              ) : (
                <Image
                  src="/images/qrcode.jpg"
                  alt="QR code PIX"
                  width={220}
                  height={220}
                  className={`rounded-lg ${pixCarregando ? "opacity-40" : ""}`}
                />
              )}
            </div>

            <div className="rounded-xl bg-[#f7f8fc] divide-y divide-gray-200 mb-5">
              <InfoRow label="Valor a pagar" value={formatBRL(resultado.entrada)} destaque />
              <InfoRow label="Chave PIX - CNPJ" value="34.295.555/0001-20" />
              <InfoRow label="Beneficiário" value="Insider Mentoring" />
            </div>

            {pixAtual && (
              <button
                type="button"
                onClick={copiarCodigoPix}
                className="w-full rounded-full bg-[#1B2A6B] py-3 text-sm font-bold text-white mb-3"
              >
                {pixCopiado ? "Código copiado!" : "Copiar código PIX (copia e cola)"}
              </button>
            )}

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#E8522A]" />
              <span className="text-sm font-semibold text-[#1B2A6B]">PIX Instantâneo</span>
            </div>
            <p className="text-center text-xs text-gray-400 mb-5">
              Aponte a câmera
              <br />
              para o QR code
            </p>

            <button
              type="button"
              onClick={() => setStep("calc")}
              className="w-full rounded-full border border-[#1B2A6B]/20 py-3 text-sm font-semibold text-[#1B2A6B]"
            >
              Voltar ao simulador
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  destaque,
}: {
  label: string;
  value: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-xs text-gray-500">{label}</span>
      <span
        className={`text-sm font-semibold ${destaque ? "text-[#E8522A]" : "text-[#1B2A6B]"}`}
      >
        {value}
      </span>
    </div>
  );
}
