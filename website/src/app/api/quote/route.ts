import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET = "Main";

function getSheets() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function findRowByEmail(
  sheets: ReturnType<typeof getSheets>,
  email: string
): Promise<number | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET}!C:C`,
  });
  const rows = res.data.values ?? [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0]?.toString().toLowerCase() === email.toLowerCase()) {
      return i + 1; // 1-indexed sheet row
    }
  }
  return null;
}

function buildRow(data: Record<string, unknown>, partial: boolean): unknown[] {
  const now = new Date();
  const timestamp = now
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(",", "");

  return [
    partial ? "Partial" : "",
    timestamp,
    data.email ?? "",
    data.firstName ?? "",
    data.lastName ?? "",
    data.countryCode ?? "",
    data.state ?? "",
    data.city ?? "",
    data.postcode ?? "",
    data.streetName ?? "",
    data.streetNumber ?? "",
    data.apartment ?? "",
    data.residential ? "TRUE" : "FALSE",
    data.offices ? "TRUE" : "FALSE",
    data.commercial ? "TRUE" : "FALSE",
    data.residentialSubtype ?? "",
    data.interior ? "TRUE" : "FALSE",
    data.exterior ? "TRUE" : "FALSE",
    data.landscape ? "TRUE" : "FALSE",
    data.constructionType ?? "",
    data.demolition ?? "",
    data.area ?? "",
    data.unit ?? "",
    data.projectSite ?? "",
    data.completion ?? "",
    data.package ?? "",
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { partial = false, ...data } = body as Record<string, unknown> & {
      partial?: boolean;
    };

    if (!data.email || typeof data.email !== "string") {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const sheets = getSheets();
    const row = buildRow(data, partial);
    const existingRowIndex = await findRowByEmail(sheets, data.email as string);

    if (existingRowIndex !== null) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET}!A${existingRowIndex}:Z${existingRowIndex}`,
        valueInputOption: "RAW",
        requestBody: { values: [row] },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET}!A:Z`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [row] },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/quote]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
