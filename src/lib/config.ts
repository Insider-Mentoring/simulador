import { CONFIG_PADRAO, type ConfigPrecos, type Plano } from "@/lib/pricing";

const STORAGE_KEY = "insider-mentoring-config-v1";

export function carregarConfig(): ConfigPrecos {
  if (typeof window === "undefined") return CONFIG_PADRAO;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return CONFIG_PADRAO;
    const parsed = JSON.parse(raw) as Partial<ConfigPrecos>;
    return {
      taxaDesconto:
        typeof parsed.taxaDesconto === "number" ? parsed.taxaDesconto : CONFIG_PADRAO.taxaDesconto,
      valorCheio: {
        individual: parsed.valorCheio?.individual ?? CONFIG_PADRAO.valorCheio.individual,
        dupla: parsed.valorCheio?.dupla ?? CONFIG_PADRAO.valorCheio.dupla,
        trio: parsed.valorCheio?.trio ?? CONFIG_PADRAO.valorCheio.trio,
      },
    };
  } catch {
    return CONFIG_PADRAO;
  }
}

export function salvarConfig(config: ConfigPrecos) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function ehConfigPadrao(config: ConfigPrecos): boolean {
  return (
    config.taxaDesconto === CONFIG_PADRAO.taxaDesconto &&
    (Object.keys(CONFIG_PADRAO.valorCheio) as Plano[]).every(
      (plano) => config.valorCheio[plano] === CONFIG_PADRAO.valorCheio[plano],
    )
  );
}
