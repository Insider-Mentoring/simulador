"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { PLANOS, getBounds, simular, type Plano } from "@/lib/pricing";
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

  const resultado = useMemo(() => {
    const valor = parseValor(entradaInput) || bounds.min;
    return simular(plano, valor);
  }, [plano, entradaInput, bounds.min]);

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
    <div className="w-full max-w-sm">
    <div className="overflow-hidden rounded-[20px] shadow-[0_12px_48px_rgba(27,42,107,0.18)]">
      <div className="leading-none">
        <Image
          src={`${BASE_PATH}/images/banner.jpg`}
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
            {view === "calculadora" ? "Calculadora" : step === "calc" ? "Simulador de investimento" : "Pagamento"}
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setView("simulador")}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
              view === "simulador" ? "bg-[#1B2A6B] text-white" : "bg-[#f0f2f8] text-[#1B2A6B]"
            }`}
          >
            Simulador
          </button>
          <button
            type="button"
            onClick={() => setView("calculadora")}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
              view === "calculadora" ? "bg-[#1B2A6B] text-white" : "bg-[#f0f2f8] text-[#1B2A6B]"
            }`}
          >
            Calculadora
          </button>
        </div>

        {view === "calculadora" ? (
          <Calculadora />
        ) : step === "calc" ? (
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
              <CurrencyInput
                value={entradaInput}
                onChange={setEntradaInput}
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
                : "Valor fora da tabela oficial — calculado com 17,441% de desconto."}
            </p>

            <button
              type="button"
              onClick={irParaPagamento}
              className="mt-5 w-full rounded-full bg-[#E8522A] py-3 text-sm font-bold text-white"
            >
              Ir para pagamento
            </button>
          </>
        ) : (
          <>
            <label className="block mb-5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B95B8]">
                Valor a cobrar
              </span>
              <CurrencyInput
                value={pixValorInput}
                onChange={setPixValorOverride}
                className="mt-1 w-full rounded-lg border border-[#E8F0FE] px-3 py-2 text-lg font-bold text-[#1B2A6B] focus:outline-none focus:ring-2 focus:ring-[#1B2A6B]/30"
              />
            </label>

            <div className="mb-5 flex items-center justify-center rounded-2xl border-[3px] border-[#E8522A] bg-white p-4">
              {pixAtual ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pixAtual.qrCodeImage}
                  alt="QR code PIX"
                  width={230}
                  height={230}
                  className="block w-full max-w-[230px] rounded-md"
                />
              ) : (
                <Image
                  src={`${BASE_PATH}/images/qrcode.jpg`}
                  alt="QR code PIX"
                  width={230}
                  height={230}
                  className={`block w-full max-w-[230px] rounded-md ${pixCarregando ? "opacity-40" : ""}`}
                />
              )}
            </div>

            <div className="mb-2 overflow-hidden rounded-xl border-[1.5px] border-[#E8F0FE]">
              <InfoRowOriginal label="Chave PIX — CNPJ" value="34.295.555/0001-20" />
              <InfoRowOriginal label="Beneficiário" value="Insider Mentoring" borderTop />
            </div>
          </>
        )}
      </div>

      {naPagina && (
        <div className="flex items-center justify-between bg-[#1B2A6B] px-6 py-4">
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

      {naPagina && (
        <button
          type="button"
          onClick={() => setStep("calc")}
          className="mt-4 w-full rounded-full border border-[#1B2A6B]/20 py-3 text-sm font-semibold text-[#1B2A6B]"
        >
          Voltar ao simulador
        </button>
      )}
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
    <div className={`flex items-center px-4 py-3 ${borderTop ? "border-t-[1.5px] border-[#E8F0FE]" : ""}`}>
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
