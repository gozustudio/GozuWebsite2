# Quote Form Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current single-page QuoteForm with a 4-step wizard that saves partial and full submissions to `Database - Form Responses` (Google Sheets) via a Next.js API route authenticated with a service account.

**Architecture:** Multi-step React form with Framer Motion transitions and localStorage persistence. On Step 1 completion a partial row is upserted to Google Sheets (Prospects = "Partial"). On final submit the same row is updated with all data (Prospects = ""). Deduplication key is email address.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS 4, Framer Motion 12, `googleapis` npm package, Google Sheets API v4, service account JWT auth.

---

## Task 1: Install `googleapis` and configure environment

**Files:**
- Modify: `website/package.json`
- Create: `website/.env.local`

**Step 1: Install the dependency**

```bash
cd website
npm install googleapis
```

Expected output: `added X packages` with `googleapis` listed.

**Step 2: Create `.env.local`**

Extract the values from the JSON key file at repo root:

```bash
cd ..  # back to repo root
node -e "
const k = require('./gozu-service-account.json');
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL=' + k.client_email);
console.log('GOOGLE_PRIVATE_KEY=\"' + k.private_key.replace(/\n/g, '\\\\n') + '\"');
console.log('GOOGLE_SPREADSHEET_ID=1LJo7px07ANM0iMQc0iCovuuz-MRaZL7oiap4lC4QmYI');
"
```

Copy the output into `website/.env.local`. It should look like:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=gozu-website@gozu-studio-website.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=1LJo7px07ANM0iMQc0iCovuuz-MRaZL7oiap4lC4QmYI
```

**Step 3: Verify `.env.local` is gitignored**

`.gitignore` already has `.env*` — nothing to do.

**Step 4: Commit**

```bash
cd website
git add package.json package-lock.json
git commit -m "add googleapis dependency for Sheets API"
```

---

## Task 2: Create countries constant

**Files:**
- Create: `website/src/lib/countries.ts`

**Step 1: Write the file**

```typescript
// website/src/lib/countries.ts
export const COUNTRIES: { code: string; name: string }[] = [
  { code: "CO001", name: "Afghanistan" },
  { code: "CO002", name: "Albania" },
  { code: "CO003", name: "Algeria" },
  { code: "CO004", name: "Andorra" },
  { code: "CO005", name: "Angola" },
  { code: "CO006", name: "Antigua and Barbuda" },
  { code: "CO007", name: "Argentina" },
  { code: "CO008", name: "Armenia" },
  { code: "CO009", name: "Australia" },
  { code: "CO010", name: "Austria" },
  { code: "CO011", name: "Azerbaijan" },
  { code: "CO012", name: "Bahamas" },
  { code: "CO013", name: "Bahrain" },
  { code: "CO014", name: "Bangladesh" },
  { code: "CO015", name: "Barbados" },
  { code: "CO016", name: "Belarus" },
  { code: "CO017", name: "Belgium" },
  { code: "CO018", name: "Belize" },
  { code: "CO019", name: "Benin" },
  { code: "CO020", name: "Bhutan" },
  { code: "CO021", name: "Bolivia" },
  { code: "CO022", name: "Bosnia and Herzegovina" },
  { code: "CO023", name: "Botswana" },
  { code: "CO024", name: "Brazil" },
  { code: "CO025", name: "Brunei" },
  { code: "CO026", name: "Bulgaria" },
  { code: "CO027", name: "Burkina Faso" },
  { code: "CO028", name: "Burundi" },
  { code: "CO029", name: "Cabo Verde" },
  { code: "CO030", name: "Cambodia" },
  { code: "CO031", name: "Cameroon" },
  { code: "CO032", name: "Canada" },
  { code: "CO033", name: "Central African Republic" },
  { code: "CO034", name: "Chad" },
  { code: "CO035", name: "Chile" },
  { code: "CO036", name: "China" },
  { code: "CO037", name: "Colombia" },
  { code: "CO038", name: "Comoros" },
  { code: "CO039", name: "Congo, Democratic Republic of the" },
  { code: "CO040", name: "Congo, Republic of the" },
  { code: "CO041", name: "Costa Rica" },
  { code: "CO042", name: "Croatia" },
  { code: "CO043", name: "Cuba" },
  { code: "CO044", name: "Cyprus" },
  { code: "CO045", name: "Czech Republic" },
  { code: "CO046", name: "Denmark" },
  { code: "CO047", name: "Djibouti" },
  { code: "CO048", name: "Dominica" },
  { code: "CO049", name: "Dominican Republic" },
  { code: "CO050", name: "Ecuador" },
  { code: "CO051", name: "Egypt" },
  { code: "CO052", name: "El Salvador" },
  { code: "CO053", name: "Equatorial Guinea" },
  { code: "CO054", name: "Eritrea" },
  { code: "CO055", name: "Estonia" },
  { code: "CO056", name: "Eswatini" },
  { code: "CO057", name: "Ethiopia" },
  { code: "CO058", name: "Fiji" },
  { code: "CO059", name: "Finland" },
  { code: "CO060", name: "France" },
  { code: "CO061", name: "Gabon" },
  { code: "CO062", name: "Gambia" },
  { code: "CO063", name: "Georgia" },
  { code: "CO064", name: "Germany" },
  { code: "CO065", name: "Ghana" },
  { code: "CO066", name: "Greece" },
  { code: "CO067", name: "Grenada" },
  { code: "CO068", name: "Guatemala" },
  { code: "CO069", name: "Guinea" },
  { code: "CO070", name: "Guinea-Bissau" },
  { code: "CO071", name: "Guyana" },
  { code: "CO072", name: "Haiti" },
  { code: "CO073", name: "Honduras" },
  { code: "CO074", name: "Hungary" },
  { code: "CO075", name: "Iceland" },
  { code: "CO076", name: "India" },
  { code: "CO077", name: "Indonesia" },
  { code: "CO078", name: "Iran" },
  { code: "CO079", name: "Iraq" },
  { code: "CO080", name: "Ireland" },
  { code: "CO081", name: "Israel" },
  { code: "CO082", name: "Italy" },
  { code: "CO083", name: "Jamaica" },
  { code: "CO084", name: "Japan" },
  { code: "CO085", name: "Jordan" },
  { code: "CO086", name: "Kazakhstan" },
  { code: "CO087", name: "Kenya" },
  { code: "CO088", name: "Kiribati" },
  { code: "CO089", name: "Korea, North" },
  { code: "CO090", name: "Korea, South" },
  { code: "CO091", name: "Kosovo" },
  { code: "CO092", name: "Kuwait" },
  { code: "CO093", name: "Kyrgyzstan" },
  { code: "CO094", name: "Laos" },
  { code: "CO095", name: "Latvia" },
  { code: "CO096", name: "Lebanon" },
  { code: "CO097", name: "Lesotho" },
  { code: "CO098", name: "Liberia" },
  { code: "CO099", name: "Libya" },
  { code: "CO100", name: "Liechtenstein" },
  { code: "CO101", name: "Lithuania" },
  { code: "CO102", name: "Luxembourg" },
  { code: "CO103", name: "Madagascar" },
  { code: "CO104", name: "Malawi" },
  { code: "CO105", name: "Malaysia" },
  { code: "CO106", name: "Maldives" },
  { code: "CO107", name: "Mali" },
  { code: "CO108", name: "Malta" },
  { code: "CO109", name: "Marshall Islands" },
  { code: "CO110", name: "Mauritania" },
  { code: "CO111", name: "Mauritius" },
  { code: "CO112", name: "Mexico" },
  { code: "CO113", name: "Micronesia" },
  { code: "CO114", name: "Moldova" },
  { code: "CO115", name: "Monaco" },
  { code: "CO116", name: "Mongolia" },
  { code: "CO117", name: "Montenegro" },
  { code: "CO118", name: "Morocco" },
  { code: "CO119", name: "Mozambique" },
  { code: "CO120", name: "Myanmar" },
  { code: "CO121", name: "Namibia" },
  { code: "CO122", name: "Nauru" },
  { code: "CO123", name: "Nepal" },
  { code: "CO124", name: "Netherlands" },
  { code: "CO125", name: "New Zealand" },
  { code: "CO126", name: "Nicaragua" },
  { code: "CO127", name: "Niger" },
  { code: "CO128", name: "Nigeria" },
  { code: "CO129", name: "North Macedonia" },
  { code: "CO130", name: "Norway" },
  { code: "CO131", name: "Oman" },
  { code: "CO132", name: "Pakistan" },
  { code: "CO133", name: "Palau" },
  { code: "CO134", name: "Palestine" },
  { code: "CO135", name: "Panama" },
  { code: "CO136", name: "Papua New Guinea" },
  { code: "CO137", name: "Paraguay" },
  { code: "CO138", name: "Peru" },
  { code: "CO139", name: "Philippines" },
  { code: "CO140", name: "Poland" },
  { code: "CO141", name: "Portugal" },
  { code: "CO142", name: "Qatar" },
  { code: "CO143", name: "Romania" },
  { code: "CO144", name: "Russia" },
  { code: "CO145", name: "Rwanda" },
  { code: "CO146", name: "Saint Kitts and Nevis" },
  { code: "CO147", name: "Saint Lucia" },
  { code: "CO148", name: "Saint Vincent and the Grenadines" },
  { code: "CO149", name: "Samoa" },
  { code: "CO150", name: "San Marino" },
  { code: "CO151", name: "São Tomé and Príncipe" },
  { code: "CO152", name: "Saudi Arabia" },
  { code: "CO153", name: "Senegal" },
  { code: "CO154", name: "Serbia" },
  { code: "CO155", name: "Seychelles" },
  { code: "CO156", name: "Sierra Leone" },
  { code: "CO157", name: "Singapore" },
  { code: "CO158", name: "Slovakia" },
  { code: "CO159", name: "Slovenia" },
  { code: "CO160", name: "Solomon Islands" },
  { code: "CO161", name: "Somalia" },
  { code: "CO162", name: "South Africa" },
  { code: "CO163", name: "South Sudan" },
  { code: "CO164", name: "Spain" },
  { code: "CO165", name: "Sri Lanka" },
  { code: "CO166", name: "Sudan" },
  { code: "CO167", name: "Suriname" },
  { code: "CO168", name: "Sweden" },
  { code: "CO169", name: "Switzerland" },
  { code: "CO170", name: "Syria" },
  { code: "CO171", name: "Taiwan" },
  { code: "CO172", name: "Tajikistan" },
  { code: "CO173", name: "Tanzania" },
  { code: "CO174", name: "Thailand" },
  { code: "CO175", name: "Timor-Leste" },
  { code: "CO176", name: "Togo" },
  { code: "CO177", name: "Tonga" },
  { code: "CO178", name: "Trinidad and Tobago" },
  { code: "CO179", name: "Tunisia" },
  { code: "CO180", name: "Turkey" },
  { code: "CO181", name: "Turkmenistan" },
  { code: "CO182", name: "Tuvalu" },
  { code: "CO183", name: "Uganda" },
  { code: "CO184", name: "Ukraine" },
  { code: "CO185", name: "United Arab Emirates" },
  { code: "CO186", name: "United Kingdom" },
  { code: "CO187", name: "United States" },
  { code: "CO188", name: "Uruguay" },
  { code: "CO189", name: "Uzbekistan" },
  { code: "CO190", name: "Vanuatu" },
  { code: "CO191", name: "Vatican City" },
  { code: "CO192", name: "Venezuela" },
  { code: "CO193", name: "Vietnam" },
  { code: "CO194", name: "Yemen" },
  { code: "CO195", name: "Zambia" },
  { code: "CO196", name: "Zimbabwe" },
];
```

**Step 2: Verify TypeScript compiles**

```bash
cd website && npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add website/src/lib/countries.ts
git commit -m "add countries constant from Database - Countries"
```

---

## Task 3: Create the API route

**Files:**
- Create: `website/src/app/api/quote/route.ts`

**Step 1: Write the route**

```typescript
// website/src/app/api/quote/route.ts
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
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
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
```

**Step 2: Verify TypeScript compiles**

```bash
cd website && npx tsc --noEmit
```

Expected: no errors.

**Step 3: Smoke test the API**

Start the dev server: `npm run dev`

In a new terminal, send a test POST:

```bash
curl -X POST http://localhost:3000/api/quote \
  -H "Content-Type: application/json" \
  -d '{"email":"test-api@example.com","firstName":"Test","lastName":"API","partial":true}'
```

Expected response: `{"ok":true}`

Open `Database - Form Responses` in Google Sheets — you should see a new row with `email = test-api@example.com` and `Prospects = Partial`.

Send the same request again — confirm the row is **updated, not duplicated**.

**Step 4: Delete the test row from the spreadsheet manually.**

**Step 5: Commit**

```bash
git add website/src/app/api/quote/route.ts
git commit -m "add /api/quote route with Google Sheets upsert"
```

---

## Task 4: QuoteForm shell — step state, indicator, navigation, transitions

**Files:**
- Modify: `website/src/components/sections/QuoteForm.tsx` (full rewrite)

**Step 1: Write the shell with step indicator and Framer Motion transitions**

Replace the entire file content:

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES } from "@/lib/countries";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FormData = {
  // Step 1
  email: string;
  firstName: string;
  lastName: string;
  // Step 2
  countryCode: string;
  countryName: string;
  state: string;
  city: string;
  postcode: string;
  streetName: string;
  streetNumber: string;
  apartment: string;
  // Step 3
  residential: boolean;
  offices: boolean;
  commercial: boolean;
  residentialSubtype: string;
  interior: boolean;
  exterior: boolean;
  landscape: boolean;
  constructionType: string;
  demolition: string;
  area: string;
  unit: string;
  projectSite: string;
  completion: string;
  // Step 4
  package: string;
};

const INITIAL: FormData = {
  email: "", firstName: "", lastName: "",
  countryCode: "", countryName: "", state: "", city: "",
  postcode: "", streetName: "", streetNumber: "", apartment: "",
  residential: false, offices: false, commercial: false, residentialSubtype: "",
  interior: false, exterior: false, landscape: false,
  constructionType: "", demolition: "", area: "", unit: "Square Metres",
  projectSite: "", completion: "",
  package: "",
};

const LS_KEY = "gozu_quote_v1";
const TOTAL_STEPS = 4;

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-10 flex items-center justify-center">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i <= current
                ? "bg-[var(--color-main)]"
                : "border border-[var(--color-border)]/30 bg-transparent"
            }`}
          />
          {i < TOTAL_STEPS - 1 && (
            <div
              className={`h-px w-14 transition-all duration-500 ${
                i < current ? "bg-[var(--color-main)]" : "bg-[var(--color-border)]/20"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
      {children}
    </p>
  );
}

function TextInput({
  id, name, type = "text", value, onChange, placeholder, required,
}: {
  id: string; name: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <input
      id={id} name={name} type={type} value={value} required={required}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-b border-[var(--color-border)]/20 bg-transparent py-3 text-[var(--color-body)] outline-none transition-colors placeholder:text-[var(--color-label)]/50 focus:border-[var(--color-main)]"
    />
  );
}

// Single or multi-select option card
function OptionCard({
  label, selected, onClick,
}: {
  label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-5 py-3 text-[11px] font-medium uppercase tracking-[2px] transition-all duration-200 ${
        selected
          ? "border-[var(--color-main)] bg-[var(--color-bg)] text-[var(--color-body)]"
          : "border-[var(--color-border)]/20 text-[var(--color-label)] hover:border-[var(--color-main)]/40"
      }`}
    >
      {label}
    </button>
  );
}

// Searchable country combobox
function CountryCombobox({
  value, countryName, onChange,
}: {
  value: string; countryName: string;
  onChange: (code: string, name: string) => void;
}) {
  const [query, setQuery] = useState(countryName);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.length > 0
    ? COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Keep query in sync if parent value changes (e.g. restored from localStorage)
  useEffect(() => {
    if (countryName && query !== countryName) setQuery(countryName);
  }, [countryName]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search country…"
        className="w-full border-b border-[var(--color-border)]/20 bg-transparent py-3 text-[var(--color-body)] outline-none transition-colors placeholder:text-[var(--color-label)]/50 focus:border-[var(--color-main)]"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-20 max-h-48 overflow-auto border border-[var(--color-border)]/20 bg-[var(--color-container)] shadow-lg">
          {filtered.map((c) => (
            <li
              key={c.code}
              onMouseDown={() => {
                onChange(c.code, c.name);
                setQuery(c.name);
                setOpen(false);
              }}
              className="cursor-pointer px-4 py-2.5 text-sm text-[var(--color-body)] hover:bg-[var(--color-bg)]"
            >
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuoteForm() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [data, setData] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const partialSentRef = useRef(false);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { step: number; data: FormData };
        setData(parsed.data);
        setStep(parsed.step);
      }
    } catch {}
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    if (submitted) return;
    localStorage.setItem(LS_KEY, JSON.stringify({ step, data }));
  }, [step, data, submitted]);

  function update(patch: Partial<FormData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  // Partial save — fires once when leaving Step 1
  async function sendPartial(formData: FormData) {
    if (partialSentRef.current) return;
    partialSentRef.current = true;
    try {
      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, partial: true }),
      });
    } catch {
      // silent — partial save is best-effort
    }
  }

  // Update partial row as user progresses through steps 2–3
  async function sendProgressUpdate(formData: FormData) {
    try {
      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, partial: true }),
      });
    } catch {}
  }

  async function handleNext() {
    setDirection(1);
    if (step === 0) {
      // Fire partial save with contact info (best-effort, don't await)
      sendPartial(data);
    } else if (step > 0 && step < 3) {
      sendProgressUpdate(data);
    }
    setStep((s) => s + 1);
  }

  function handleBack() {
    setDirection(-1);
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, partial: false }),
      });
      if (!res.ok) throw new Error("submission failed");
      localStorage.removeItem(LS_KEY);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Slide variants ──
  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  // ── Success state ──
  if (submitted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-sm bg-[var(--color-container)] p-12">
        <div className="text-center">
          <p className="font-serif text-2xl text-[var(--color-body)]">
            Thank you for your request.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            We&apos;ll review your project details and respond within 48 hours
            with a personalised estimate.
          </p>
        </div>
      </div>
    );
  }

  // ── Step titles ──
  const STEP_LABELS = ["Contact", "Address", "Project", "Package"];

  return (
    <div className="rounded-sm bg-[var(--color-container)] p-8 lg:p-12">
      <StepIndicator current={step} />

      <p className="mb-8 text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
        Step {step + 1} of {TOTAL_STEPS} — {STEP_LABELS[step]}
      </p>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {step === 0 && <Step1 data={data} update={update} />}
          {step === 1 && <Step2 data={data} update={update} />}
          {step === 2 && <Step3 data={data} update={update} />}
          {step === 3 && <Step4 data={data} update={update} />}
        </motion.div>
      </AnimatePresence>

      {error && (
        <p className="mt-4 text-sm text-[var(--color-error)]">{error}</p>
      )}

      {/* Navigation */}
      <div className={`mt-10 flex ${step > 0 ? "justify-between" : "justify-end"}`}>
        {step > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)] transition-colors hover:text-[var(--color-body)]"
          >
            ← Back
          </button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid(step, data)}
            className="border border-[var(--color-main)] bg-[var(--color-main)] px-10 py-3 text-[11px] font-medium uppercase tracking-[3px] text-white transition-all duration-300 hover:bg-transparent hover:text-[var(--color-body)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !isStepValid(step, data)}
            className="border border-[var(--color-main)] bg-[var(--color-main)] px-10 py-3 text-[11px] font-medium uppercase tracking-[3px] text-white transition-all duration-300 hover:bg-transparent hover:text-[var(--color-body)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Sending…" : "Submit Request"}
          </button>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-[var(--color-label)]">
        No commitment required. We typically respond within 48 hours.
      </p>
    </div>
  );
}

// ─── Step validation ──────────────────────────────────────────────────────────

function isStepValid(step: number, d: FormData): boolean {
  switch (step) {
    case 0:
      return !!d.email && !!d.firstName && !!d.lastName;
    case 1:
      return !!d.countryCode && !!d.city;
    case 2:
      return (
        (d.residential || d.offices || d.commercial) &&
        (d.interior || d.exterior || d.landscape) &&
        !!d.constructionType &&
        !!d.demolition &&
        !!d.area &&
        !!d.projectSite &&
        !!d.completion
      );
    case 3:
      return !!d.package;
    default:
      return false;
  }
}

// ─── Step 1: Contact ──────────────────────────────────────────────────────────

function Step1({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <Label>Email *</Label>
        <TextInput id="email" name="email" type="email" value={data.email}
          onChange={(v) => update({ email: v })} placeholder="your@email.com" required />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label>First Name *</Label>
          <TextInput id="firstName" name="firstName" value={data.firstName}
            onChange={(v) => update({ firstName: v })} placeholder="First name" required />
        </div>
        <div>
          <Label>Last Name *</Label>
          <TextInput id="lastName" name="lastName" value={data.lastName}
            onChange={(v) => update({ lastName: v })} placeholder="Last name" required />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Project Address ──────────────────────────────────────────────────

function Step2({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <Label>Country *</Label>
        <CountryCombobox
          value={data.countryCode}
          countryName={data.countryName}
          onChange={(code, name) => update({ countryCode: code, countryName: name })}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label>State / County</Label>
          <TextInput id="state" name="state" value={data.state}
            onChange={(v) => update({ state: v })} placeholder="State or county" />
        </div>
        <div>
          <Label>City *</Label>
          <TextInput id="city" name="city" value={data.city}
            onChange={(v) => update({ city: v })} placeholder="City" required />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label>Postcode</Label>
          <TextInput id="postcode" name="postcode" value={data.postcode}
            onChange={(v) => update({ postcode: v })} placeholder="Postcode" />
        </div>
        <div>
          <Label>Street Name</Label>
          <TextInput id="streetName" name="streetName" value={data.streetName}
            onChange={(v) => update({ streetName: v })} placeholder="Street name" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label>Street Number</Label>
          <TextInput id="streetNumber" name="streetNumber" value={data.streetNumber}
            onChange={(v) => update({ streetNumber: v })} placeholder="No." />
        </div>
        <div>
          <Label>Apartment / Unit</Label>
          <TextInput id="apartment" name="apartment" value={data.apartment}
            onChange={(v) => update({ apartment: v })} placeholder="Apt / unit" />
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Project Details ──────────────────────────────────────────────────

function Step3({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-10">
      {/* Property Type */}
      <div>
        <Label>Property Type * (select all that apply)</Label>
        <div className="mt-3 flex flex-wrap gap-3">
          <OptionCard label="Residential" selected={data.residential}
            onClick={() => update({ residential: !data.residential, residentialSubtype: data.residential ? "" : data.residentialSubtype })} />
          <OptionCard label="Offices" selected={data.offices}
            onClick={() => update({ offices: !data.offices })} />
          <OptionCard label="Commercial" selected={data.commercial}
            onClick={() => update({ commercial: !data.commercial })} />
        </div>
      </div>

      {/* Residential sub-type — conditional */}
      {data.residential && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Label>Residential Property Type *</Label>
          <div className="mt-3 flex flex-wrap gap-3">
            <OptionCard label="Single Family" selected={data.residentialSubtype === "Single Family Property"}
              onClick={() => update({ residentialSubtype: "Single Family Property" })} />
            <OptionCard label="Multiple Family" selected={data.residentialSubtype === "Multiple Family Property"}
              onClick={() => update({ residentialSubtype: "Multiple Family Property" })} />
          </div>
        </motion.div>
      )}

      {/* Project Scope */}
      <div>
        <Label>Project Scope * (select all that apply)</Label>
        <div className="mt-3 flex flex-wrap gap-3">
          <OptionCard label="Interior" selected={data.interior}
            onClick={() => update({ interior: !data.interior })} />
          <OptionCard label="Exterior" selected={data.exterior}
            onClick={() => update({ exterior: !data.exterior })} />
          <OptionCard label="Landscape" selected={data.landscape}
            onClick={() => update({ landscape: !data.landscape })} />
        </div>
      </div>

      {/* Construction Type */}
      <div>
        <Label>Construction Type *</Label>
        <div className="mt-3 flex flex-wrap gap-3">
          <OptionCard label="Renovation" selected={data.constructionType === "Renovation"}
            onClick={() => update({ constructionType: "Renovation" })} />
          <OptionCard label="Construction from zero" selected={data.constructionType === "Construction from zero"}
            onClick={() => update({ constructionType: "Construction from zero" })} />
        </div>
      </div>

      {/* Demolition */}
      <div>
        <Label>Demolition Required? *</Label>
        <div className="mt-3 flex flex-wrap gap-3">
          <OptionCard label="Yes" selected={data.demolition === "Yes"}
            onClick={() => update({ demolition: "Yes" })} />
          <OptionCard label="No" selected={data.demolition === "No"}
            onClick={() => update({ demolition: "No" })} />
        </div>
      </div>

      {/* Area */}
      <div>
        <Label>Project Area *</Label>
        <div className="mt-3 flex items-end gap-4">
          <div className="flex-1">
            <TextInput id="area" name="area" type="number" value={data.area}
              onChange={(v) => update({ area: v })} placeholder="e.g. 120" />
          </div>
          <div className="flex gap-2 pb-3">
            <OptionCard label="m²" selected={data.unit === "Square Metres"}
              onClick={() => update({ unit: "Square Metres" })} />
            <OptionCard label="ft²" selected={data.unit === "Square Feet"}
              onClick={() => update({ unit: "Square Feet" })} />
          </div>
        </div>
      </div>

      {/* Project Site */}
      <div>
        <Label>Project Site *</Label>
        <div className="mt-3 flex flex-wrap gap-3">
          <OptionCard label="On-site" selected={data.projectSite === "On-site"}
            onClick={() => update({ projectSite: "On-site" })} />
          <OptionCard label="Remote" selected={data.projectSite === "Remote"}
            onClick={() => update({ projectSite: "Remote" })} />
        </div>
        {data.projectSite === "Remote" && (
          <p className="mt-2 text-xs text-[var(--color-label)]">
            Remote projects require accurate existing plans.
          </p>
        )}
      </div>

      {/* Completion */}
      <div>
        <Label>Preferred Completion *</Label>
        <div className="mt-3 flex flex-wrap gap-3">
          <OptionCard label="As soon as possible" selected={data.completion === "As soon as possible"}
            onClick={() => update({ completion: "As soon as possible" })} />
          <OptionCard label="5–6 months" selected={data.completion === "5-6 months"}
            onClick={() => update({ completion: "5-6 months" })} />
          <OptionCard label="6–12 months" selected={data.completion === "6-12 months"}
            onClick={() => update({ completion: "6-12 months" })} />
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Package ──────────────────────────────────────────────────────────

const PACKAGES = [
  {
    id: "Standard",
    tagline: "All the basic technical plans",
    services: [
      "Interior Concept", "Partition Plan", "Furniture Plan",
      "Lighting Plan", "Electrical Outlet Plan", "Electrical Switch Plan",
      "Plumbing Plan", "Ceiling Plan", "Floor Plan",
      "Ventilation Plan", "Tile Layout Sections",
    ],
  },
  {
    id: "Advance",
    tagline: "More advanced with aesthetics specialist advice",
    services: [
      "Technical Drawing Package", "3D Model", "Kitchen Sketches",
      "Furniture Sketches", "Material Selection", "Lighting Selection",
      "Remote Consultations",
    ],
  },
  {
    id: "Premium",
    tagline: "Complete with realistic visualizations",
    services: [
      "Ordered Furniture Selection", "Interior Details Selection",
      "5 Photorealistic Visualizations",
    ],
  },
];

function Step4({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-4">
      {PACKAGES.map((pkg, i) => (
        <button
          key={pkg.id}
          type="button"
          onClick={() => update({ package: pkg.id })}
          className={`w-full border p-6 text-left transition-all duration-200 ${
            data.package === pkg.id
              ? "border-[var(--color-main)] bg-[var(--color-bg)]"
              : "border-[var(--color-border)]/20 hover:border-[var(--color-main)]/40"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
                Package {i + 1}
              </p>
              <p className="mt-1 font-serif text-xl text-[var(--color-body)]">
                {pkg.id}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {pkg.tagline}
              </p>
            </div>
            <div
              className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                data.package === pkg.id
                  ? "border-[var(--color-main)] bg-[var(--color-main)]"
                  : "border-[var(--color-border)]/40"
              }`}
            />
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {pkg.services.map((s) => (
              <li
                key={s}
                className="border border-[var(--color-border)]/15 px-2 py-1 text-[10px] uppercase tracking-[1px] text-[var(--color-label)]"
              >
                {s}
              </li>
            ))}
          </ul>
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

```bash
cd website && npx tsc --noEmit
```

Expected: no errors.

**Step 3: Manually test in browser**

```bash
npm run dev
```

Navigate to `http://localhost:3000/quote`.

Check:
- [ ] Step indicator shows 4 dots, first dot gold
- [ ] Step label shows "Step 1 of 4 — Contact"
- [ ] Next button disabled until Email + First Name + Last Name filled
- [ ] Next button enabled once all 3 fields have values
- [ ] Clicking Next slides to Step 2
- [ ] Back button appears on Step 2, clicking Back returns to Step 1 with data preserved
- [ ] Step 2 Next disabled until Country + City filled
- [ ] Country combobox filters as you type, clicking a result fills it
- [ ] Step 3 options highlight on click, Next disabled until all required fields selected
- [ ] If Residential selected, sub-type selector appears
- [ ] Step 4 package cards are clickable, Submit button disabled until one selected
- [ ] Submitting shows "Sending…" then success state
- [ ] After submit, `gozu_quote_v1` is removed from localStorage
- [ ] Refresh mid-form: data and step are restored from localStorage

**Step 4: Verify row appears in Google Sheets**

Submit with a real test email. Open `Database - Form Responses` and confirm:
- Row appears with all 26 columns populated correctly
- `Prospects` column is empty (not "Partial")
- `Timestamp` format matches existing rows (`DD/MM/YYYY HH:MM:SS`)

**Step 5: Delete the test row from the spreadsheet.**

**Step 6: Commit**

```bash
git add website/src/components/sections/QuoteForm.tsx
git commit -m "replace QuoteForm with 4-step wizard with partial saves and Google Sheets integration"
```

---

## Task 5: Fix WebMCP — update the form's tool attributes

The old form had `toolname` on the `<form>` element. The new form uses buttons, not a traditional `<form>`. Update the WebMCP tool registration.

**Files:**
- Modify: `website/src/components/webmcp/WebMCPTools.tsx`

**Step 1: Read the current file**

Open `website/src/components/webmcp/WebMCPTools.tsx` and find the `request_quote_gozu_studio` tool registration.

**Step 2: Update the tool description to match the new fields**

Find the `request_quote_gozu_studio` tool and update its description and parameters to reflect the new multi-step data structure. The tool should describe all 4 steps of data it collects.

**Step 3: Verify TypeScript compiles**

```bash
cd website && npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add website/src/components/webmcp/WebMCPTools.tsx
git commit -m "update WebMCP quote tool description for new multi-step form"
```

---

## Task 6: Add Vercel environment variables (pre-deploy checklist)

When deploying to Vercel, add these 3 environment variables in the Vercel project dashboard under **Settings → Environment Variables**:

| Name | Value | Source |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `gozu-website@gozu-studio-website.iam.gserviceaccount.com` | `gozu-service-account.json` → `client_email` |
| `GOOGLE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...` | `gozu-service-account.json` → `private_key` |
| `GOOGLE_SPREADSHEET_ID` | `1LJo7px07ANM0iMQc0iCovuuz-MRaZL7oiap4lC4QmYI` | fixed |

**Important:** When pasting `GOOGLE_PRIVATE_KEY` into Vercel, paste the raw value from the JSON file (with literal `\n` characters). Vercel handles the escaping correctly.

---

## Post-launch: Update UpdateProspectsDatabase script

After the new form is live, update the `UpdateProspectsDatabase` Google Apps Script to skip rows where column A (`Prospects`) equals `"Partial"`. The likely change is adding a condition:

```javascript
// Existing pattern (approximate — adapt to actual code):
if (row[0] === "" || row[0] === false || row[0] === "FALSE") {
  // process this row
}

// Updated to also skip partial:
if ((row[0] === "" || row[0] === false || row[0] === "FALSE") && row[0] !== "Partial") {
  // process this row
}
```

This ensures abandoned partial submissions don't get turned into prospects. Completed submissions (Prospects = "") are processed normally.
