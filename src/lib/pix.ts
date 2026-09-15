import { createStaticPix, hasError } from "pix-utils";

const PIX_KEY = "34295555000120"; // CNPJ 34.295.555/0001-20, somente digitos
const MERCHANT_NAME = "INSIDER MENTORING";
const MERCHANT_CITY = "BRASILIA";

export type PixCobranca = {
  brCode: string;
  qrCodeImage: string;
};

export async function gerarPixCobranca(valor: number): Promise<PixCobranca> {
  const pix = createStaticPix({
    merchantName: MERCHANT_NAME,
    merchantCity: MERCHANT_CITY,
    pixKey: PIX_KEY,
    transactionAmount: Math.round(valor * 100) / 100,
    txid: "***",
  });

  if (hasError(pix)) {
    throw new Error(pix.message);
  }

  const [brCode, qrCodeImage] = await Promise.all([pix.toBRCode(), pix.toImage()]);
  return { brCode, qrCodeImage };
}
