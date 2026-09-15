import { ImageResponse } from "next/og";
import { brandIconElement } from "@/lib/brandIcon";

export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(brandIconElement(512), { width: 512, height: 512 });
}
