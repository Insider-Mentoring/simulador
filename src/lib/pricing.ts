export type Plano = "individual" | "dupla" | "trio";

type Row = {
  entrada: number;
  desconto: number;
  remanescente: number;
};

export type ResultadoSimulacao = Row & {
  parcelaRestante: number;
  investimentoTotal: number;
  exato: boolean;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

// Valores transcritos da tabela impressa (fotos). O plano Individual veio de
// uma foto rotacionada/mais dificil de ler - vale conferir com a fonte original.
const TRIO: Row[] = [
  // R$3.000 e a "Oferta Padrao" (sem desconto de entrada, so valor cheio -
  // entrada). Nao existe oferta real de R$2.000 para o Trio.
  { entrada: 3000, desconto: 0, remanescente: 79202.75 },
  { entrada: 4000, desconto: 697.65, remanescente: 77505.1 },
  { entrada: 5000, desconto: 872.06, remanescente: 76330.69 },
  { entrada: 6000, desconto: 1046.47, remanescente: 75156.28 },
  { entrada: 7000, desconto: 1220.88, remanescente: 73981.87 },
  { entrada: 8000, desconto: 1395.29, remanescente: 72807.46 },
  { entrada: 9000, desconto: 1569.7, remanescente: 71633.05 },
  { entrada: 10000, desconto: 1744.11, remanescente: 70458.64 },
  { entrada: 11000, desconto: 1918.52, remanescente: 69284.23 },
  { entrada: 12000, desconto: 2092.93, remanescente: 68109.82 },
  { entrada: 13000, desconto: 2267.34, remanescente: 66935.41 },
  { entrada: 14000, desconto: 2441.75, remanescente: 65761.0 },
  { entrada: 15000, desconto: 2616.16, remanescente: 64586.59 },
  { entrada: 16000, desconto: 2790.57, remanescente: 63412.18 },
  { entrada: 17000, desconto: 2964.98, remanescente: 62237.77 },
  { entrada: 18000, desconto: 3139.39, remanescente: 61063.36 },
  { entrada: 19000, desconto: 3313.8, remanescente: 59888.95 },
  { entrada: 20000, desconto: 3488.21, remanescente: 58714.54 },
  { entrada: 21000, desconto: 3662.62, remanescente: 57540.13 },
  { entrada: 22000, desconto: 3837.03, remanescente: 56365.72 },
  { entrada: 23000, desconto: 4011.44, remanescente: 55191.31 },
  { entrada: 24000, desconto: 4185.85, remanescente: 54016.9 },
  { entrada: 25000, desconto: 4360.26, remanescente: 52842.49 },
  { entrada: 26000, desconto: 4534.67, remanescente: 51668.08 },
  { entrada: 27000, desconto: 4709.08, remanescente: 50493.67 },
  { entrada: 28000, desconto: 4883.49, remanescente: 49319.26 },
  { entrada: 29000, desconto: 5057.9, remanescente: 48144.85 },
  { entrada: 30000, desconto: 5232.31, remanescente: 46970.44 },
  { entrada: 31000, desconto: 5406.72, remanescente: 45796.03 },
  { entrada: 32000, desconto: 5581.13, remanescente: 44621.62 },
  { entrada: 33000, desconto: 5755.54, remanescente: 43447.21 },
  { entrada: 34000, desconto: 5929.95, remanescente: 42272.8 },
  { entrada: 35000, desconto: 6104.36, remanescente: 41098.39 },
  { entrada: 36000, desconto: 6278.77, remanescente: 39923.98 },
  { entrada: 37000, desconto: 6453.18, remanescente: 38749.57 },
  { entrada: 38000, desconto: 6627.59, remanescente: 37575.16 },
  { entrada: 39000, desconto: 6802.0, remanescente: 36400.75 },
  { entrada: 40000, desconto: 6976.41, remanescente: 35226.34 },
  { entrada: 41000, desconto: 7150.82, remanescente: 34051.93 },
  { entrada: 42000, desconto: 7325.23, remanescente: 32877.52 },
  { entrada: 43000, desconto: 7499.64, remanescente: 31703.11 },
  { entrada: 44000, desconto: 7674.05, remanescente: 30528.7 },
  { entrada: 45000, desconto: 7848.46, remanescente: 29354.29 },
  { entrada: 46000, desconto: 8022.87, remanescente: 28179.88 },
  { entrada: 47000, desconto: 8197.28, remanescente: 27005.47 },
  { entrada: 48000, desconto: 8371.69, remanescente: 25831.06 },
  { entrada: 49000, desconto: 8546.1, remanescente: 24656.65 },
  { entrada: 50000, desconto: 8720.51, remanescente: 23482.24 },
  { entrada: 51000, desconto: 8894.92, remanescente: 22307.83 },
  { entrada: 52000, desconto: 9069.33, remanescente: 21133.42 },
  { entrada: 53000, desconto: 9243.74, remanescente: 19959.01 },
  { entrada: 54000, desconto: 9418.15, remanescente: 18784.6 },
  { entrada: 55000, desconto: 9592.56, remanescente: 17610.19 },
  { entrada: 56000, desconto: 9766.97, remanescente: 16435.78 },
  { entrada: 57000, desconto: 9941.38, remanescente: 15261.37 },
  { entrada: 58000, desconto: 10115.79, remanescente: 14086.96 },
  { entrada: 59000, desconto: 10290.2, remanescente: 12912.55 },
  { entrada: 60000, desconto: 10464.61, remanescente: 11738.14 },
  { entrada: 61000, desconto: 10639.02, remanescente: 10563.73 },
  { entrada: 62000, desconto: 10813.43, remanescente: 9389.32 },
  { entrada: 63000, desconto: 10987.84, remanescente: 8214.91 },
  { entrada: 64000, desconto: 11162.25, remanescente: 7040.5 },
  { entrada: 65000, desconto: 11336.66, remanescente: 5866.09 },
  { entrada: 66000, desconto: 11511.07, remanescente: 4691.68 },
  { entrada: 67000, desconto: 11685.48, remanescente: 3517.27 },
  { entrada: 68000, desconto: 11859.89, remanescente: 2342.86 },
  { entrada: 69000, desconto: 12034.3, remanescente: 1168.45 },
  { entrada: 69994.75, desconto: 12208.71, remanescente: 0 },
];

const DUPLA: Row[] = [
  // R$3.000 e a "Oferta Padrao" (sem desconto de entrada, so valor cheio -
  // entrada). Nao existe oferta real de R$2.000 para a Dupla.
  { entrada: 3000, desconto: 0, remanescente: 67459.5 },
  { entrada: 4000, desconto: 697.65, remanescente: 65761.85 },
  { entrada: 5000, desconto: 872.06, remanescente: 64587.44 },
  { entrada: 6000, desconto: 1046.47, remanescente: 63413.03 },
  { entrada: 7000, desconto: 1220.88, remanescente: 62238.62 },
  { entrada: 8000, desconto: 1395.29, remanescente: 61064.21 },
  { entrada: 9000, desconto: 1569.7, remanescente: 59889.8 },
  { entrada: 10000, desconto: 1744.11, remanescente: 58715.39 },
  { entrada: 11000, desconto: 1918.52, remanescente: 57540.98 },
  { entrada: 12000, desconto: 2092.93, remanescente: 56366.57 },
  { entrada: 13000, desconto: 2267.34, remanescente: 55192.16 },
  { entrada: 14000, desconto: 2441.75, remanescente: 54017.75 },
  { entrada: 15000, desconto: 2616.16, remanescente: 52843.34 },
  { entrada: 16000, desconto: 2790.57, remanescente: 51668.93 },
  { entrada: 17000, desconto: 2964.98, remanescente: 50494.52 },
  { entrada: 18000, desconto: 3139.39, remanescente: 49320.11 },
  { entrada: 19000, desconto: 3313.8, remanescente: 48145.7 },
  { entrada: 20000, desconto: 3488.21, remanescente: 46971.29 },
  { entrada: 21000, desconto: 3662.62, remanescente: 45796.88 },
  { entrada: 22000, desconto: 3837.03, remanescente: 44622.47 },
  { entrada: 23000, desconto: 4011.44, remanescente: 43448.06 },
  { entrada: 24000, desconto: 4185.85, remanescente: 42273.65 },
  { entrada: 25000, desconto: 4360.26, remanescente: 41099.24 },
  { entrada: 26000, desconto: 4534.67, remanescente: 39924.83 },
  { entrada: 27000, desconto: 4709.08, remanescente: 38750.42 },
  { entrada: 28000, desconto: 4883.49, remanescente: 37576.01 },
  { entrada: 29000, desconto: 5057.9, remanescente: 36401.6 },
  { entrada: 30000, desconto: 5232.31, remanescente: 35227.19 },
  { entrada: 31000, desconto: 5406.72, remanescente: 34052.78 },
  { entrada: 32000, desconto: 5581.13, remanescente: 32878.37 },
  { entrada: 33000, desconto: 5755.54, remanescente: 31703.96 },
  { entrada: 34000, desconto: 5929.95, remanescente: 30529.55 },
  { entrada: 35000, desconto: 6104.36, remanescente: 29355.14 },
  { entrada: 36000, desconto: 6278.77, remanescente: 28180.73 },
  { entrada: 37000, desconto: 6453.18, remanescente: 27006.32 },
  { entrada: 38000, desconto: 6627.59, remanescente: 25831.91 },
  { entrada: 39000, desconto: 6802.0, remanescente: 24657.5 },
  { entrada: 40000, desconto: 6976.41, remanescente: 23483.09 },
  { entrada: 41000, desconto: 7150.82, remanescente: 22308.68 },
  { entrada: 42000, desconto: 7325.23, remanescente: 21134.27 },
  { entrada: 43000, desconto: 7499.64, remanescente: 19959.86 },
  { entrada: 44000, desconto: 7674.05, remanescente: 18785.45 },
  { entrada: 45000, desconto: 7848.46, remanescente: 17611.04 },
  { entrada: 46000, desconto: 8022.87, remanescente: 16436.63 },
  { entrada: 47000, desconto: 8197.28, remanescente: 15262.22 },
  { entrada: 48000, desconto: 8371.69, remanescente: 14087.81 },
  { entrada: 49000, desconto: 8546.1, remanescente: 12913.4 },
  { entrada: 50000, desconto: 8720.51, remanescente: 11738.99 },
  { entrada: 51000, desconto: 8894.92, remanescente: 10564.58 },
  { entrada: 52000, desconto: 9069.33, remanescente: 9390.17 },
  { entrada: 53000, desconto: 9243.74, remanescente: 8215.76 },
  { entrada: 54000, desconto: 9418.15, remanescente: 7041.35 },
  { entrada: 55000, desconto: 9592.56, remanescente: 5866.94 },
  { entrada: 56000, desconto: 9766.97, remanescente: 4692.53 },
  { entrada: 57000, desconto: 9941.38, remanescente: 3518.12 },
  { entrada: 58000, desconto: 10115.79, remanescente: 2343.71 },
  { entrada: 59000, desconto: 10290.2, remanescente: 1169.3 },
  { entrada: 59995.5, desconto: 10464.61, remanescente: 0 },
];

const INDIVIDUAL: Row[] = [
  // R$2.000 e a "Oferta Padrao" (sem desconto de entrada, so valor cheio -
  // entrada), igual ao minimo da Dupla/Trio.
  { entrada: 2000, desconto: 0, remanescente: 44973 },
  { entrada: 3000, desconto: 523.24, remanescente: 43449.76 },
  { entrada: 4000, desconto: 697.65, remanescente: 42275.35 },
  { entrada: 5000, desconto: 872.07, remanescente: 41100.93 },
  { entrada: 6000, desconto: 1046.48, remanescente: 39926.52 },
  { entrada: 7000, desconto: 1220.9, remanescente: 38752.1 },
  { entrada: 8000, desconto: 1395.31, remanescente: 37577.69 },
  { entrada: 9000, desconto: 1569.73, remanescente: 36403.27 },
  { entrada: 10000, desconto: 1744.14, remanescente: 35228.86 },
  { entrada: 11000, desconto: 1918.56, remanescente: 34054.44 },
  { entrada: 12000, desconto: 2092.97, remanescente: 32880.03 },
  { entrada: 13000, desconto: 2267.39, remanescente: 31705.61 },
  { entrada: 14000, desconto: 2441.8, remanescente: 30531.2 },
  { entrada: 15000, desconto: 2616.22, remanescente: 29356.78 },
  { entrada: 16000, desconto: 2790.63, remanescente: 28182.37 },
  { entrada: 17000, desconto: 2965.05, remanescente: 27007.95 },
  { entrada: 18000, desconto: 3139.46, remanescente: 25833.54 },
  { entrada: 19000, desconto: 3313.88, remanescente: 24659.12 },
  { entrada: 20000, desconto: 3488.29, remanescente: 23484.71 },
  { entrada: 21000, desconto: 3662.71, remanescente: 22310.29 },
  { entrada: 22000, desconto: 3837.12, remanescente: 21135.88 },
  { entrada: 23000, desconto: 4011.54, remanescente: 19961.46 },
  { entrada: 24000, desconto: 4185.95, remanescente: 18787.05 },
  { entrada: 25000, desconto: 4360.37, remanescente: 17612.63 },
  { entrada: 26000, desconto: 4534.78, remanescente: 16438.22 },
  { entrada: 27000, desconto: 4709.2, remanescente: 15263.8 },
  { entrada: 28000, desconto: 4883.61, remanescente: 14089.39 },
  { entrada: 29000, desconto: 5058.03, remanescente: 12914.97 },
  { entrada: 30000, desconto: 5232.44, remanescente: 11740.56 },
  { entrada: 31000, desconto: 5406.86, remanescente: 10566.19 },
  { entrada: 32000, desconto: 5581.27, remanescente: 9391.78 },
  { entrada: 33000, desconto: 5755.69, remanescente: 8217.37 },
  { entrada: 34000, desconto: 5930.1, remanescente: 7043.01 },
  { entrada: 35000, desconto: 6104.52, remanescente: 5868.62 },
  { entrada: 36000, desconto: 6278.93, remanescente: 4694.23 },
  { entrada: 37000, desconto: 6453.35, remanescente: 3519.72 },
  { entrada: 38000, desconto: 6627.76, remanescente: 2345.3 },
  { entrada: 39000, desconto: 6802.18, remanescente: 1170.89 },
  { entrada: 39997, desconto: 6976.0, remanescente: 0 },
];

export const PLANOS: Record<Plano, { label: string; rows: Row[] }> = {
  individual: { label: "Individual", rows: INDIVIDUAL },
  dupla: { label: "Dupla", rows: DUPLA },
  trio: { label: "Trio", rows: TRIO },
};

export function getBounds(plano: Plano) {
  const rows = PLANOS[plano].rows;
  return { min: rows[0].entrada, max: rows[rows.length - 1].entrada };
}

// Primeiro valor de entrada depois da Oferta Padrao (a segunda linha da
// tabela) - usado como valor padrao do campo de entrada no simulador.
export function getEntradaPadrao(plano: Plano) {
  const rows = PLANOS[plano].rows;
  return rows[1]?.entrada ?? rows[0].entrada;
}

export type OfertaPadrao = {
  aVista: number;
  entradaMinima: number;
  parcelaMinima: number;
};

// Resumo rapido de cada plano: o valor a vista (ultima linha da tabela, com
// o desconto maximo) e a entrada minima + parcela (primeira linha, sem
// desconto de entrada) - os mesmos numeros da "Oferta Padrao" apresentada.
export function getOfertaPadrao(plano: Plano): OfertaPadrao {
  const rows = PLANOS[plano].rows;
  const primeira = rows[0];
  const ultima = rows[rows.length - 1];
  return {
    aVista: round2(ultima.entrada + ultima.remanescente),
    entradaMinima: primeira.entrada,
    parcelaMinima: round2(primeira.remanescente / 9),
  };
}

// Percentual de desconto aplicado sobre a entrada, confirmado nas 3 tabelas
// (desconto/entrada = ~17,441% em praticamente todas as linhas).
const TAXA_DESCONTO = 0.17441;

// "Valor cheio" de cada plano (entrada + remanescente + desconto), obtido por
// regressao linear sobre as linhas oficiais da tabela. Usado só para calcular
// valores de entrada que nao existem exatamente na tabela.
const VALOR_CHEIO: Record<Plano, number> = {
  individual: 46972.97,
  dupla: 70459.5,
  trio: 82202.75,
};

const EPSILON = 0.01;

export function simular(plano: Plano, valorDesejado: number): ResultadoSimulacao {
  const rows = PLANOS[plano].rows;
  const clamped = Math.min(Math.max(valorDesejado, rows[0].entrada), rows[rows.length - 1].entrada);

  const rowExata = rows.find((row) => Math.abs(row.entrada - clamped) < EPSILON);
  if (rowExata) {
    return {
      ...rowExata,
      parcelaRestante: round2(rowExata.remanescente / 9),
      investimentoTotal: round2(rowExata.entrada + rowExata.remanescente),
      exato: true,
    };
  }

  const entrada = round2(clamped);
  const desconto = round2(entrada * TAXA_DESCONTO);
  const remanescente = round2(VALOR_CHEIO[plano] - entrada - desconto);

  return {
    entrada,
    desconto,
    remanescente,
    parcelaRestante: round2(remanescente / 9),
    investimentoTotal: round2(entrada + remanescente),
    exato: false,
  };
}
