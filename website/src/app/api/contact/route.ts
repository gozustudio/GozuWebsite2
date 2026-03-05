import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET = "Contact";

const resend = new Resend(process.env.RESEND_API_KEY);

function getSheets() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message, honeypot } = body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      honeypot?: string;
    };

    // Honeypot — silently accept to fool bots
    if (honeypot) {
      return NextResponse.json({ ok: true });
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "name, email, and message are required" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const row = [timestamp, name, email, subject ?? "", message];

    // 1. Save to Google Sheets
    const sheets = getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET}!A:E`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    // 2. Send email notification
    await resend.emails.send({
      from: "Gozu Studio Website <website@gozustudio.com>",
      to: "info@gozustudio.com",
      subject: `New Contact: ${subject ?? "General Inquiry"} — ${name}`,
      text: [
        `New contact form submission`,
        ``,
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject ?? "Not specified"}`,
        ``,
        `Message:`,
        message,
        ``,
        `---`,
        `Sent from gozustudio.com contact form at ${timestamp}`,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/contact]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
