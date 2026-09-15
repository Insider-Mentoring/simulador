import { ImageResponse } from "next/og";
import { brandIconElement } from "@/lib/brandIcon";

export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(brandIconElement(192), { width: 192, height: 192 });
}
