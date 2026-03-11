#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const CONTENT_DIR = path.resolve(__dirname, "../content");
const OUTPUT_PATH = path.join(CONTENT_DIR, "settings/packages.json");

// --- Google Sheets API auth (same pattern as translate-content.js) ---

async function getAccessToken() {
  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!email || !key) {
      console.log("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY — skipping sync.");
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(
      JSON.stringify({ alg: "RS256", typ: "JWT" })
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({
        iss: email,
        scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      })
    ).toString("base64url");

    const sign = crypto.createSign("RSA-SHA256");
    sign.update(`${header}.${payload}`);
    const signature = sign.sign(key, "base64url");
    const jwt = `${header}.${payload}.${signature}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Auth response not JSON:", text.substring(0, 200));
      return null;
    }
    if (!data.access_token) {
      console.error("Failed to get access token:", data);
      return null;
    }
    return data.access_token;
  } catch (err) {
    console.error("Auth error:", err.message || err);
    return null;
  }
}

// --- Fetch package data from Google Sheets ---

async function fetchPackages(accessToken) {
  const spreadsheetId = process.env.GOOGLE_INPUT_FIELDS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    console.log("Missing GOOGLE_INPUT_FIELDS_SPREADSHEET_ID — skipping sync.");
    return null;
  }

  const range = encodeURIComponent("BA2:BR6");
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Sheets response not JSON:", text.substring(0, 200));
    return null;
  }

  if (data.error) {
    console.error("Sheets API error:", data.error.message);
    return null;
  }

  const rows = data.values ?? [];

  return rows.map((row) => ({
    code: Number(row[0]),
    name: String(row[1] ?? ""),
    tagline: String(row[2] ?? ""),
    items: row
      .slice(3)
      .filter((v) => v !== "" && v != null)
      .map(String),
  }));
}

// --- Main ---

async function main() {
  console.log("Syncing packages from Google Sheets...");

  const accessToken = await getAccessToken();
  if (!accessToken) return;

  const packages = await fetchPackages(accessToken);
  if (!packages) return;

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(packages, null, 2));

  console.log(`Wrote ${packages.length} packages to content/settings/packages.json`);
}

main()
  .catch((err) => {
    console.error("Package sync failed:", err.message || err);
    console.log("Build will continue without updated package data.");
  })
  .then(() => process.exit(0));
