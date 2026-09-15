"use client";

import { useState } from "react";

type Operador = "+" | "-" | "×" | "÷";

function calcular(a: number, b: number, operador: Operador): number {
  switch (operador) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? NaN : a / b;
  }
}

function formatarDisplay(valor: string): string {
  if (valor === "Erro") return valor;
  const numero = Number(valor.replace(",", "."));
  if (Number.isNaN(numero)) return "Erro";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 8 }).format(numero);
}

export default function Calculadora() {
  const [display, setDisplay] = useState("0");
  const [acumulado, setAcumulado] = useState<number | null>(null);
  const [operador, setOperador] = useState<Operador | null>(null);
  const [aguardandoNovoValor, setAguardandoNovoValor] = useState(false);

  function limpar() {
    setDisplay("0");
    setAcumulado(null);
    setOperador(null);
    setAguardandoNovoValor(false);
  }

  function inputDigito(digito: string) {
    if (display === "Erro" || aguardandoNovoValor) {
      setDisplay(digito);
      setAguardandoNovoValor(false);
      return;
    }
    setDisplay(display === "0" ? digito : display + digito);
  }

  function inputPonto() {
    if (display === "Erro" || aguardandoNovoValor) {
      setDisplay("0,");
      setAguardandoNovoValor(false);
      return;
    }
    if (!display.includes(",")) setDisplay(display + ",");
  }

  function apagar() {
    if (display === "Erro" || aguardandoNovoValor) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
  }

  function alternarSinal() {
    if (display === "Erro" || display === "0") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
  }

  function valorAtual() {
    return Number(display.replace(",", "."));
  }

  function pressPercentual() {
    if (display === "Erro") return;
    const atual = valorAtual();
    // Com + ou -, "%" calcula a porcentagem sobre o valor acumulado
    // (ex: 200 + 10% = 220). Com × ou ÷, ou sem operador pendente,
    // "%" apenas converte o valor atual em fracao (ex: 200 × 50% = 100).
    const resultado =
      (operador === "+" || operador === "-") && acumulado !== null
        ? acumulado * (atual / 100)
        : atual / 100;
    setDisplay(String(resultado).replace(".", ","));
    setAguardandoNovoValor(true);
  }

  function pressOperador(novoOperador: Operador) {
    if (display === "Erro") return;
    if (operador && acumulado !== null && !aguardandoNovoValor) {
      const resultado = calcular(acumulado, valorAtual(), operador);
      setDisplay(Number.isNaN(resultado) ? "Erro" : String(resultado).replace(".", ","));
      setAcumulado(Number.isNaN(resultado) ? null : resultado);
    } else {
      setAcumulado(valorAtual());
    }
    setOperador(novoOperador);
    setAguardandoNovoValor(true);
  }

  function pressIgual() {
    if (display === "Erro" || operador === null || acumulado === null) return;
    const resultado = calcular(acumulado, valorAtual(), operador);
    setDisplay(Number.isNaN(resultado) ? "Erro" : String(resultado).replace(".", ","));
    setAcumulado(null);
    setOperador(null);
    setAguardandoNovoValor(true);
  }

  const botaoBase = "rounded-xl py-4 text-lg font-semibold transition-colors";
  const botaoNumero = `${botaoBase} bg-[#f0f2f8] text-[#1B2A6B] hover:bg-[#e4e7f2]`;
  const botaoOperador = `${botaoBase} bg-[#1B2A6B] text-white hover:bg-[#152057]`;
  const botaoAcao = `${botaoBase} bg-gray-200 text-[#1B2A6B] hover:bg-gray-300`;

  return (
    <div>
      <div className="mb-4 rounded-xl bg-[#f7f8fc] px-4 py-5 text-right">
        <div className="truncate text-3xl font-bold text-[#1B2A6B]">{formatarDisplay(display)}</div>
      </div>

      <div className="grid grid-cols-4 gap-2">
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
