import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET = "Main";

const resend = new Resend(process.env.RESEND_API_KEY);

const COMPLETION_MAP: Record<string, number> = {
  "As soon as possible": 0,
  "5–6 months": 1,
  "6–12 months": 2,
};

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
  const timestamp = new Date().toISOString();

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
    COMPLETION_MAP[data.completion as string] ?? data.completion ?? "",
    data.package ?? "",
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { partial = false, ...data } = body as Record<string, unknown> & {
      partial?: boolean;
    };

    // Fix 3: Honeypot bot protection — real users never fill this field.
    // Silently return ok so bots don't know they were blocked.
    if (data.honeypot) {
      return NextResponse.json({ ok: true });
    }

    if (!data.email || typeof data.email !== "string") {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const sheets = getSheets();
    const row = buildRow(data, partial);
    const existingRowIndex = await findRowByEmail(sheets, data.email as string);

    if (existingRowIndex !== null) {
      console.log(`[/api/quote] Updating existing row ${existingRowIndex} for ${data.email}`);
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET}!A${existingRowIndex}:Z${existingRowIndex}`,
        valueInputOption: "RAW",
        requestBody: { values: [row] },
      });
    } else {
      console.log(`[/api/quote] Appending new row for ${data.email}`);
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET}!A:Z`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [row] },
      });
    }

    // Send email notification on final submission only
    if (!partial) {
      console.log(`[/api/quote] Sending email notification for ${data.email}`);
      const projectTypes = [
        data.residential ? "Residential" : "",
        data.offices ? "Offices" : "",
        data.commercial ? "Commercial" : "",
      ].filter(Boolean).join(", ") || "Not specified";

      const emailResult = await resend.emails.send({
        from: "Gozu Studio Website <website@gozustudio.com>",
        to: "info@gozustudio.com",
        subject: `New Quote Request — ${data.firstName ?? ""} ${data.lastName ?? ""}`.trim(),
        text: [
          `New quote request submission`,
          ``,
          `Name: ${data.firstName ?? ""} ${data.lastName ?? ""}`,
          `Email: ${data.email ?? ""}`,
          `Location: ${data.city ?? ""}, ${data.state ?? ""}, ${data.postcode ?? ""}`,
          `Address: ${data.streetName ?? ""} ${data.streetNumber ?? ""}${data.apartment ? `, Apt ${data.apartment}` : ""}`,
          ``,
          `Project Type: ${projectTypes}`,
          `Construction: ${data.constructionType ?? "Not specified"}`,
          `Area: ${data.area ?? "?"} ${data.unit ?? ""}`,
          `Completion: ${data.completion ?? "Not specified"}`,
          `Package: ${data.package ?? "Not specified"}`,
          ``,
          `---`,
          `Sent from gozustudio.com quote form at ${new Date().toISOString()}`,
        ].join("\n"),
      });
      console.log(`[/api/quote] Email result:`, emailResult);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/quote]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
