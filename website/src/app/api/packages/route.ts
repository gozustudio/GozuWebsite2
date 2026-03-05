import { NextResponse } from "next/server";
import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_INPUT_FIELDS_SPREADSHEET_ID!;

function getSheets() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

export type PackageData = {
  code: number;
  name: string;
  tagline: string;
  items: string[];
};

export async function GET() {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "BA2:BR6", // Skip header row, 5 packages, columns BA through BR
    });

    const rows = res.data.values ?? [];

    const packages: PackageData[] = rows.map((row) => ({
      code: Number(row[0]),
      name: String(row[1] ?? ""),
      tagline: String(row[2] ?? ""),
      items: row.slice(3).filter((v: unknown) => v !== "" && v != null).map(String),
    }));

    return NextResponse.json(packages, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("[/api/packages]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
