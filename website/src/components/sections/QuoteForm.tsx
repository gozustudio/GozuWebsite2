"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES } from "@/lib/countries";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  email: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  countryName: string;
  state: string;
  city: string;
  postcode: string;
  streetName: string;
  streetNumber: string;
  apartment: string;
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
                i < current
                  ? "bg-[var(--color-main)]"
                  : "bg-[var(--color-border)]/20"
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

function CountryCombobox({
  value, countryName, onChange,
}: {
  value: string; countryName: string;
  onChange: (code: string, name: string) => void;
}) {
  const [query, setQuery] = useState(countryName);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered =
    query.length > 0
      ? COUNTRIES.filter((c) =>
          c.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8)
      : [];

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (countryName && query !== countryName) setQuery(countryName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryName]);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
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

// ─── Step components ──────────────────────────────────────────────────────────

function Step1({
  data, update,
}: {
  data: FormData;
  update: (p: Partial<FormData>) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <Label>Email *</Label>
        <TextInput
          id="email" name="email" type="email" value={data.email}
          onChange={(v) => update({ email: v })}
          placeholder="your@email.com" required
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label>First Name *</Label>
          <TextInput
            id="firstName" name="firstName" value={data.firstName}
            onChange={(v) => update({ firstName: v })}
            placeholder="First name" required
          />
        </div>
        <div>
          <Label>Last Name *</Label>
          <TextInput
            id="lastName" name="lastName" value={data.lastName}
            onChange={(v) => update({ lastName: v })}
            placeholder="Last name" required
          />
        </div>
      </div>
    </div>
  );
}

function Step2({
  data, update,
}: {
  data: FormData;
  update: (p: Partial<FormData>) => void;
}) {
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
          <TextInput
            id="state" name="state" value={data.state}
            onChange={(v) => update({ state: v })} placeholder="State or county"
          />
        </div>
        <div>
          <Label>City *</Label>
          <TextInput
            id="city" name="city" value={data.city}
            onChange={(v) => update({ city: v })} placeholder="City" required
          />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label>Postcode</Label>
          <TextInput
            id="postcode" name="postcode" value={data.postcode}
            onChange={(v) => update({ postcode: v })} placeholder="Postcode"
          />
        </div>
        <div>
          <Label>Street Name</Label>
          <TextInput
            id="streetName" name="streetName" value={data.streetName}
            onChange={(v) => update({ streetName: v })} placeholder="Street name"
          />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label>Street Number</Label>
          <TextInput
            id="streetNumber" name="streetNumber" value={data.streetNumber}
            onChange={(v) => update({ streetNumber: v })} placeholder="No."
          />
        </div>
        <div>
          <Label>Apartment / Unit</Label>
          <TextInput
            id="apartment" name="apartment" value={data.apartment}
            onChange={(v) => update({ apartment: v })} placeholder="Apt / unit"
          />
        </div>
      </div>
    </div>
  );
}

function Step3({
  data, update,
}: {
  data: FormData;
  update: (p: Partial<FormData>) => void;
}) {
  return (
    <div className="space-y-10">
      <div>
        <Label>Property Type * (select all that apply)</Label>
        <div className="mt-3 flex flex-wrap gap-3">
          <OptionCard
            label="Residential" selected={data.residential}
            onClick={() =>
              update({
                residential: !data.residential,
                residentialSubtype: data.residential ? "" : data.residentialSubtype,
              })
            }
          />
          <OptionCard
            label="Offices" selected={data.offices}
            onClick={() => update({ offices: !data.offices })}
          />
          <OptionCard
            label="Commercial" selected={data.commercial}
            onClick={() => update({ commercial: !data.commercial })}
          />
        </div>
      </div>

      {data.residential && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Label>Residential Property Type *</Label>
          <div className="mt-3 flex flex-wrap gap-3">
            <OptionCard
              label="Single Family"
              selected={data.residentialSubtype === "Single Family Property"}
              onClick={() => update({ residentialSubtype: "Single Family Property" })}
            />
            <OptionCard
              label="Multiple Family"
              selected={data.residentialSubtype === "Multiple Family Property"}
              onClick={() => update({ residentialSubtype: "Multiple Family Property" })}
            />
          </div>
        </motion.div>
      )}

      <div>
        <Label>Project Scope * (select all that apply)</Label>
        <div className="mt-3 flex flex-wrap gap-3">
          <OptionCard
            label="Interior" selected={data.interior}
            onClick={() => update({ interior: !data.interior })}
          />
          <OptionCard
            label="Exterior" selected={data.exterior}
            onClick={() => update({ exterior: !data.exterior })}
          />
          <OptionCard
            label="Landscape" selected={data.landscape}
            onClick={() => update({ landscape: !data.landscape })}
          />
        </div>
      </div>

      <div>
        <Label>Construction Type *</Label>
        <div className="mt-3 flex flex-wrap gap-3">
          <OptionCard
            label="Renovation"
            selected={data.constructionType === "Renovation"}
            onClick={() => update({ constructionType: "Renovation" })}
          />
          <OptionCard
            label="Construction from zero"
            selected={data.constructionType === "Construction from zero"}
            onClick={() => update({ constructionType: "Construction from zero" })}
          />
        </div>
      </div>

      <div>
        <Label>Demolition Required? *</Label>
        <div className="mt-3 flex flex-wrap gap-3">
          <OptionCard
            label="Yes" selected={data.demolition === "Yes"}
            onClick={() => update({ demolition: "Yes" })}
          />
          <OptionCard
            label="No" selected={data.demolition === "No"}
            onClick={() => update({ demolition: "No" })}
          />
        </div>
      </div>

      <div>
        <Label>Project Area *</Label>
        <div className="mt-3 flex items-end gap-4">
          <div className="flex-1">
            <TextInput
              id="area" name="area" type="number" value={data.area}
              onChange={(v) => update({ area: v })} placeholder="e.g. 120"
            />
          </div>
          <div className="flex gap-2 pb-3">
            <OptionCard
              label="m²" selected={data.unit === "Square Metres"}
              onClick={() => update({ unit: "Square Metres" })}
            />
            <OptionCard
              label="ft²" selected={data.unit === "Square Feet"}
              onClick={() => update({ unit: "Square Feet" })}
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Project Site *</Label>
        <div className="mt-3 flex flex-wrap gap-3">
          <OptionCard
            label="On-site" selected={data.projectSite === "On-site"}
            onClick={() => update({ projectSite: "On-site" })}
          />
          <OptionCard
            label="Remote" selected={data.projectSite === "Remote"}
            onClick={() => update({ projectSite: "Remote" })}
          />
        </div>
        {data.projectSite === "Remote" && (
          <p className="mt-2 text-xs text-[var(--color-label)]">
            Remote projects require accurate existing plans.
          </p>
        )}
      </div>

      <div>
        <Label>Preferred Completion *</Label>
        <div className="mt-3 flex flex-wrap gap-3">
          <OptionCard
            label="As soon as possible"
            selected={data.completion === "As soon as possible"}
            onClick={() => update({ completion: "As soon as possible" })}
          />
          <OptionCard
            label="5–6 months"
            selected={data.completion === "5-6 months"}
            onClick={() => update({ completion: "5-6 months" })}
          />
          <OptionCard
            label="6–12 months"
            selected={data.completion === "6-12 months"}
            onClick={() => update({ completion: "6-12 months" })}
          />
        </div>
      </div>
    </div>
  );
}

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

function Step4({
  data, update,
}: {
  data: FormData;
  update: (p: Partial<FormData>) => void;
}) {
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuoteForm() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const partialSentRef = useRef(false);

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

  useEffect(() => {
    if (submitted) return;
    localStorage.setItem(LS_KEY, JSON.stringify({ step, data }));
  }, [step, data, submitted]);

  function update(patch: Partial<FormData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  async function sendPartial(formData: FormData) {
    if (partialSentRef.current) return;
    partialSentRef.current = true;
    try {
      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, partial: true }),
      });
    } catch {}
  }

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

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

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

      <div
        className={`mt-10 flex ${step > 0 ? "justify-between" : "justify-end"}`}
      >
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
