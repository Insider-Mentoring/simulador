import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { BASE_PATH } from "@/lib/basePath";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Insider Mentoring - Simulador",
  description: "Simulador de entrada e pagamento do programa Insider Mentoring",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Insider Mentoring",
  },
  icons: {
    icon: `${BASE_PATH}/icon-192.png`,
    apple: `${BASE_PATH}/icon-192.png`,
  },
};

export const viewport: Viewport = {
  themeColor: "#1B2A6B",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
