#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const MESSAGES_DIR = path.resolve(__dirname, "../messages");
const LOCALES = [
  "bg","cs","da","de","el","es","et","fi","fr","hr",
  "hu","it","lt","lv","nl","no","pl","pt","ro","ru",
  "sk","sl","sr","sv","uk",
];

async function getAccessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) { console.log("Missing credentials"); return null; }
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: email, scope: "https://www.googleapis.com/auth/cloud-translation",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  })).toString("base64url");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(key, "base64url");
  const jwt = `${header}.${payload}.${signature}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  return data.access_token || null;
}

async function translateBatch(texts, targetLocale, accessToken) {
  const googleLocale = targetLocale === "no" ? "no" : targetLocale;
  const res = await fetch("https://translation.googleapis.com/language/translate/v2", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ q: texts, source: "en", target: googleLocale, format: "text" }),
  });
  const data = await res.json();
  if (data.error) { console.error(`Error for ${targetLocale}:`, data.error.message); return texts; }
  return data.data.translations.map((t) =>
    t.translatedText.replace(/&#39;/g, "'").replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  );
}

async function main() {
  const namespace = process.argv[2] || "quote";
  console.log(`Translating messages namespace: ${namespace}`);

  const enPath = path.join(MESSAGES_DIR, "en.json");
  const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));
  const sourceStrings = en[namespace];
  if (!sourceStrings) { console.error(`Namespace "${namespace}" not found in en.json`); return; }

  const keys = Object.keys(sourceStrings);
  const values = keys.map((k) => sourceStrings[k]);

  const accessToken = await getAccessToken();
  if (!accessToken) { console.log("No credentials — skipping."); return; }

  for (const locale of LOCALES) {
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    const localeData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const existing = localeData[namespace] || {};

    // Find keys that need translating (not present in target)
    const needsTranslation = keys.filter((k) => !(k in existing));

    if (needsTranslation.length === 0) {
      console.log(`  ${locale}: up to date`);
      continue;
    }

    const textsToTranslate = needsTranslation.map((k) => sourceStrings[k]);
    const translated = await translateBatch(textsToTranslate, locale, accessToken);

    const merged = { ...existing };
    needsTranslation.forEach((k, i) => { merged[k] = translated[i]; });

    // Ensure key order matches English
    const ordered = {};
    for (const k of keys) { ordered[k] = merged[k] ?? sourceStrings[k]; }
    localeData[namespace] = ordered;

    fs.writeFileSync(filePath, JSON.stringify(localeData, null, 2) + "\n");
    console.log(`  ${locale}: translated ${needsTranslation.length} new keys`);
  }

  console.log("Done.");
}

main().catch((err) => { console.error("Failed:", err.message); process.exit(1); });
