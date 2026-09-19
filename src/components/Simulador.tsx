"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { MAX_PARCELAS, PLANOS, getBounds, getOfertaPadrao, simular, type Plano } from "@/lib/pricing";
import { gerarPixCobranca, type PixCobranca } from "@/lib/pix";
import Calculadora from "@/components/Calculadora";
import CurrencyInput, { numeroParaTextoBR } from "@/components/CurrencyInput";
import { BASE_PATH } from "@/lib/basePath";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const parseValor = (texto: string) => Number(texto.replace(/\./g, "").replace(",", "."));

const PLANO_OPTIONS: Plano[] = ["individual", "dupla", "trio"];

export default function Simulador() {
  const [view, setView] = useState<"simulador" | "calculadora">("simulador");
  const [plano, setPlano] = useState<Plano>("individual");
  const [step, setStep] = useState<"calc" | "pagamento">("calc");
  const bounds = getBounds(plano);
  const [entradaInput, setEntradaInput] = useState(numeroParaTextoBR(bounds.min));
  const [parcelasInput, setParcelasInput] = useState(String(MAX_PARCELAS));

  const entradaDigitada = parseValor(entradaInput);
  const entradaAbaixoDoMinimo = entradaDigitada > 0 && entradaDigitada < bounds.min;

  const parcelasDigitadas = parseInt(parcelasInput, 10);
  const parcelasAcimaDoMaximo = parcelasDigitadas > MAX_PARCELAS;
  const numParcelas = Math.min(Math.max(parcelasDigitadas || MAX_PARCELAS, 1), MAX_PARCELAS);

  const resultado = useMemo(() => {
    const valor = entradaDigitada || bounds.min;
    return simular(plano, valor, numParcelas);
  }, [plano, entradaDigitada, bounds.min, numParcelas]);

  const oferta = getOfertaPadrao(plano);
  const ehEntradaMinima = Math.abs(resultado.entrada - bounds.min) < 0.01;

  function handlePlanoChange(novoPlano: Plano) {
    setPlano(novoPlano);
    setEntradaInput(numeroParaTextoBR(getBounds(novoPlano).min));
  }

  const [pixValorOverride, setPixValorOverride] = useState<string | null>(null);
  const pixValorInput = pixValorOverride ?? numeroParaTextoBR(resultado.entrada);
  const pixValorParsed = parseValor(pixValorInput) || resultado.entrada;

  function irParaPagamento() {
    setPixValorOverride(null);
    setStep("pagamento");
  }

  const [pix, setPix] = useState<{ valor: number; cobranca: PixCobranca } | null>(null);

  useEffect(() => {
    if (step !== "pagamento" || pixValorParsed <= 0) return;
    let cancelado = false;
    gerarPixCobranca(pixValorParsed).then((cobranca) => {
      if (!cancelado) setPix({ valor: pixValorParsed, cobranca });
    });
    return () => {
      cancelado = true;
    };
  }, [step, pixValorParsed]);

  const pixAtual = pix?.valor === pixValorParsed ? pix.cobranca : null;
  const pixCarregando = step === "pagamento" && !pixAtual;

  const naPagina = view === "simulador" && step === "pagamento";

  return (
    <div className="flex w-full min-h-0 flex-col sm:w-full sm:max-w-sm">
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden sm:rounded-[20px] sm:shadow-[0_12px_48px_rgba(27,42,107,0.18)]">
      <div className="shrink-0 leading-none">
        <Image
          src={`${BASE_PATH}/images/banner.jpg`}
          alt="Insider Mentoring"
          width={933}
          height={268}
          className="w-full block"
          priority
        />
      </div>

      <div className="flex flex-1 min-h-0 flex-col bg-white px-6 pb-4 pt-5 overflow-y-auto">
        <div className="mb-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-extrabold leading-tight tracking-tight text-[#1B2A6B]">
              Insider <span className="text-[#E8522A]">Mentoring</span>
            </div>
            {naPagina ? (
              <button
                type="button"
                onClick={() => setStep("calc")}
                className="shrink-0 rounded-full bg-[#f0f2f8] px-3 py-1.5 text-xs font-semibold text-[#1B2A6B]"
              >
                ← Voltar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setView(view === "calculadora" ? "simulador" : "calculadora")}
                className="shrink-0 rounded-full bg-[#f0f2f8] px-3 py-1.5 text-xs font-semibold text-[#1B2A6B]"
              >
                {view === "calculadora" ? "← Voltar" : "Calculadora"}
              </button>
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {view === "calculadora" ? "Calculadora" : step === "calc" ? "Desconto progressivo" : "Pagamento"}
          </div>
        </div>

        {view === "calculadora" ? (
          <Calculadora />
        ) : step === "calc" ? (
          <div className="flex flex-1 min-h-0 flex-col">
            <div className="flex gap-2 mb-4">
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

            <div className="mb-4 rounded-xl bg-[#f0f2f8] p-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#E8522A]">
                Oferta na imersão — {PLANOS[plano].label}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">À vista</span>
                <span className="text-sm font-bold text-[#1B2A6B]">{formatBRL(oferta.aVista)}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B95B8]">
                A Prazo
              </div>

              <div className="flex gap-3">
              <label className="block flex-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Valor de entrada
                </span>
                <CurrencyInput
                  value={entradaInput}
                  onChange={setEntradaInput}
                  className={`mt-1 w-full rounded-lg px-3 py-2 text-lg font-semibold text-[#1B2A6B] focus:outline-none focus:ring-2 ${
                    entradaAbaixoDoMinimo
                      ? "border-2 border-[#E8522A] bg-[#FDECE7] focus:ring-[#E8522A]/30"
                      : "border border-gray-200 focus:ring-[#1B2A6B]/30"
                  }`}
                />
                {entradaAbaixoDoMinimo ? (
                  <span className="text-xs font-semibold text-[#E8522A]">
                    Entrada mínima de {formatBRL(bounds.min)}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">
                    Entre {formatBRL(bounds.min)} e {formatBRL(bounds.max)}
                  </span>
                )}
              </label>

              <label className="block w-24 shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Parcelas
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={parcelasInput}
                  onChange={(e) => setParcelasInput(e.target.value.replace(/\D/g, ""))}
                  className={`mt-1 w-full rounded-lg px-3 py-2 text-lg font-semibold text-[#1B2A6B] focus:outline-none focus:ring-2 ${
                    parcelasAcimaDoMaximo
                      ? "border-2 border-[#E8522A] bg-[#FDECE7] focus:ring-[#E8522A]/30"
                      : "border border-gray-200 focus:ring-[#1B2A6B]/30"
                  }`}
                />
                {parcelasAcimaDoMaximo ? (
                  <span className="text-xs font-semibold text-[#E8522A]">Máx. {MAX_PARCELAS}x</span>
                ) : (
                  <span className="text-xs text-gray-400">Até {MAX_PARCELAS}x</span>
                )}
              </label>
              </div>
            </div>

            <div className="rounded-xl bg-[#f7f8fc] divide-y divide-gray-200">
              {!ehEntradaMinima && (
                <InfoRow label="Desconto aplicado" value={formatBRL(resultado.desconto)} />
              )}
              <InfoRow
                label={`Parcela do restante (${numParcelas}x)`}
                value={formatBRL(resultado.parcelaRestante)}
              />
              <InfoRow
                label="Investimento total"
                value={formatBRL(resultado.investimentoTotal)}
                destaque
              />
            </div>

            <div className="min-h-4 flex-1" />

            <button
              type="button"
              onClick={irParaPagamento}
              className="w-full shrink-0 py-2 text-center text-sm font-medium text-[#1B2A6B] underline decoration-[#1B2A6B]/30 underline-offset-4"
            >
              Gerar QR code PIX
            </button>
          </div>
        ) : (
          <>
            <label className="block mb-4 shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B95B8]">
                Valor a cobrar
              </span>
              <CurrencyInput
                value={pixValorInput}
                onChange={setPixValorOverride}
                className="mt-1 w-full rounded-lg border border-[#E8F0FE] px-3 py-2 text-lg font-bold text-[#1B2A6B] focus:outline-none focus:ring-2 focus:ring-[#1B2A6B]/30"
              />
            </label>

            <div className="mb-4 flex flex-1 min-h-0 items-center justify-center rounded-2xl border-[3px] border-[#E8522A] bg-white p-3">
              {pixAtual ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pixAtual.qrCodeImage}
                  alt="QR code PIX"
                  width={230}
                  height={230}
                  className="block h-auto max-h-full w-auto max-w-full rounded-md object-contain"
                />
              ) : (
                <Image
                  src={`${BASE_PATH}/images/qrcode.jpg`}
                  alt="QR code PIX"
                  width={230}
                  height={230}
                  className={`block h-auto max-h-full w-auto max-w-full rounded-md object-contain ${pixCarregando ? "opacity-40" : ""}`}
                />
              )}
            </div>

            <div className="mb-2 shrink-0 overflow-hidden rounded-xl border-[1.5px] border-[#E8F0FE]">
              <InfoRowOriginal label="Chave PIX — CNPJ" value="34.295.555/0001-20" />
              <InfoRowOriginal label="Beneficiário" value="Insider Mentoring" borderTop />
            </div>
          </>
        )}
      </div>

      {naPagina && (
        <div className="flex shrink-0 items-center justify-between bg-[#1B2A6B] px-6 py-4">
          <div className="flex items-center gap-[7px] rounded-full bg-[#39C55E] px-[18px] py-[7px]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            <span className="text-[13px] font-bold tracking-[0.06em] text-white">PIX Instantâneo</span>
          </div>
          <div className="text-right text-[10px] font-semibold uppercase leading-relaxed tracking-[0.07em] text-white/45">
            Aponte a câmera
            <br />
            para o QR code
          </div>
        </div>
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
    <div className="flex items-center justify-between px-4 py-2">
      <span className="text-xs text-gray-500">{label}</span>
      <span
        className={`text-sm font-semibold ${destaque ? "text-[#E8522A]" : "text-[#1B2A6B]"}`}
      >
        {value}
      </span>
    </div>
  );
}

function InfoRowOriginal({
  label,
  value,
  borderTop,
}: {
  label: string;
  value: string;
  borderTop?: boolean;
}) {
  return (
    <div className={`flex items-center px-4 py-2 ${borderTop ? "border-t-[1.5px] border-[#E8F0FE]" : ""}`}>
      <div className="mr-[14px] h-9 w-1 flex-shrink-0 rounded-sm bg-[#E8522A]" />
      <div>
        <div className="mb-[3px] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B95B8]">
          {label}
        </div>
        <div className="text-[15px] font-bold text-[#1B2A6B]">{value}</div>
      </div>
    </div>
  );
}
