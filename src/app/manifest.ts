import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Insider Mentoring - Simulador",
    short_name: "Insider Mentoring",
    description: "Simulador de investimento e pagamento do programa Insider Mentoring",
    start_url: "/",
    display: "standalone",
    background_color: "#f0f2f8",
    theme_color: "#1B2A6B",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
