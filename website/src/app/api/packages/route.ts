import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export type PackageData = {
  code: number;
  name: string;
  tagline: string;
  items: string[];
};

export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get("locale") || "en";
    const cwd = process.cwd();

    // Try translated version first
    let filePath = "";
    if (locale && locale !== "en") {
      const translatedPath = path.resolve(cwd, `content/translated/${locale}/settings/packages.json`);
      if (fs.existsSync(translatedPath)) {
        filePath = translatedPath;
      }
    }

    // Fall back to English source
    if (!filePath) {
      filePath = path.resolve(cwd, "content/settings/packages.json");
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json([], {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
      });
    }

    const packages: PackageData[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    return NextResponse.json(packages, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    console.error("[/api/packages]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
