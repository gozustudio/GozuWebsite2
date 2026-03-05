"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES } from "@/lib/countries";

// ─── Types ────────────────────────────────────────────────────────────────────

// Fix 1: Renamed from FormData to QuoteFormData to avoid shadowing the browser
// native FormData global.
type QuoteFormData = {
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

// Fix 10: STEP_LABELS moved to module scope (was inside render).
const STEP_LABELS = ["Contact", "Address", "Project", "Package"];

const INITIAL: QuoteFormData = {
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

// Fix 4: Label renders <label> instead of <p> and accepts optional htmlFor.
function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-[var(--color-label)]"
    >
      {children}
    </label>
  );
}

// Fix 8: Added optional min prop to TextInput.
function TextInput({
  id, name, type = "text", value, onChange, placeholder, required, min,
}: {
  id: string; name: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean;
  min?: string;
}) {
  return (
    <input
      id={id} name={name} type={type} value={value} required={required}
      placeholder={placeholder} min={min}
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

// Fix 5: Added keyboard navigation, activeIndex state, and ARIA attributes.
function CountryCombobox({
  value, countryName, onChange,
}: {
  value: string; countryName: string;
  onChange: (code: string, name: string) => void;
}) {
  const [query, setQuery] = useState(countryName);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
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

  // Reset activeIndex whenever the filtered list changes.
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && activeIndex >= 0 && filtered[activeIndex]) {
        const c = filtered[activeIndex];
        onChange(c.code, c.name);
        setQuery(c.name);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search country…"
        className="w-full border-b border-[var(--color-border)]/20 bg-transparent py-3 text-[var(--color-body)] outline-none transition-colors placeholder:text-[var(--color-label)]/50 focus:border-[var(--color-main)]"
      />
      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 max-h-48 overflow-auto border border-[var(--color-border)]/20 bg-[var(--color-container)] shadow-lg"
        >
          {filtered.map((c, idx) => (
            <li
              key={c.code}
              role="option"
              aria-selected={value === c.code}
              onMouseDown={() => {
                onChange(c.code, c.name);
                setQuery(c.name);
                setOpen(false);
              }}
              className={`cursor-pointer px-4 py-2.5 text-sm text-[var(--color-body)] hover:bg-[var(--color-bg)] ${
                idx === activeIndex ? "bg-[var(--color-bg)]" : ""
              }`}
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

function isStepValid(step: number, d: QuoteFormData): boolean {
  switch (step) {
    case 0:
      return !!d.email && !!d.firstName && !!d.lastName;
    case 1:
      return !!d.countryCode && !!d.city;
    case 2:
      return (
        (d.residential || d.offices || d.commercial) &&
        (!d.residential || !!d.residentialSubtype) &&
        (d.interior || d.exterior || d.landscape) &&
        !!d.constructionType &&
        !!d.demolition &&
        parseFloat(d.area) > 0 &&
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
  data: QuoteFormData;
  update: (p: Partial<QuoteFormData>) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        {/* Fix 4: htmlFor added to Label call sites where there is a single associated input. */}
        <Label htmlFor="email">Email *</Label>
        <TextInput
          id="email" name="email" type="email" value={data.email}
          onChange={(v) => update({ email: v })}
          placeholder="your@email.com" required
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <TextInput
            id="firstName" name="firstName" value={data.firstName}
            onChange={(v) => update({ firstName: v })}
            placeholder="First name" required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
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
  data: QuoteFormData;
  update: (p: Partial<QuoteFormData>) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        {/* Country uses a combobox, no single id to associate — htmlFor omitted. */}
        <Label>Country *</Label>
        <CountryCombobox
          value={data.countryCode}
          countryName={data.countryName}
          onChange={(code, name) => update({ countryCode: code, countryName: name })}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="state">State / County</Label>
          <TextInput
            id="state" name="state" value={data.state}
            onChange={(v) => update({ state: v })} placeholder="State or county"
          />
        </div>
        <div>
          <Label htmlFor="city">City *</Label>
          <TextInput
            id="city" name="city" value={data.city}
            onChange={(v) => update({ city: v })} placeholder="City" required
          />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="postcode">Postcode</Label>
          <TextInput
            id="postcode" name="postcode" value={data.postcode}
            onChange={(v) => update({ postcode: v })} placeholder="Postcode"
          />
        </div>
        <div>
          <Label htmlFor="streetName">Street Name</Label>
          <TextInput
            id="streetName" name="streetName" value={data.streetName}
            onChange={(v) => update({ streetName: v })} placeholder="Street name"
          />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="streetNumber">Street Number</Label>
          <TextInput
            id="streetNumber" name="streetNumber" value={data.streetNumber}
            onChange={(v) => update({ streetNumber: v })} placeholder="No."
          />
        </div>
        <div>
          <Label htmlFor="apartment">Apartment / Unit</Label>
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
  data: QuoteFormData;
  update: (p: Partial<QuoteFormData>) => void;
}) {
  return (
    <div className="space-y-10">
      <div>
        {/* Option card groups have no single associated input — htmlFor omitted. */}
        <Label>Property Type * (select all that apply)</Label>
        <div className="mt-3 flex flex-wrap gap-3">
          <OptionCard
            label="Residential" selected={data.residential}
            onClick={() =>
              update({
                residential: !data.residential,
                // Fix 2: Always clear subtype when toggling residential
                // regardless of direction.
                residentialSubtype: "",
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
              label="Single Family Property"
              selected={data.residentialSubtype === "Single Family Property"}
              onClick={() => update({ residentialSubtype: "Single Family Property" })}
            />
            <OptionCard
              label="Multiple Family Property"
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
        {/* Fix 4 + Fix 8: htmlFor links label to input; min="1" enforces positive value. */}
        <Label htmlFor="area">Project Area *</Label>
        <div className="mt-3 flex items-end gap-4">
          <div className="flex-1">
            <TextInput
              id="area" name="area" type="number" value={data.area}
              onChange={(v) => update({ area: v })} placeholder="e.g. 120"
              min="1"
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
          {/* Fix 9: Stored values now use en-dashes matching display labels. */}
          <OptionCard
            label="As soon as possible"
            selected={data.completion === "As soon as possible"}
            onClick={() => update({ completion: "As soon as possible" })}
          />
          <OptionCard
            label="5–6 months"
            selected={data.completion === "5–6 months"}
            onClick={() => update({ completion: "5–6 months" })}
          />
          <OptionCard
            label="6–12 months"
            selected={data.completion === "6–12 months"}
            onClick={() => update({ completion: "6–12 months" })}
          />
        </div>
      </div>
    </div>
  );
}

type PackageData = {
  code: number;
  name: string;
  tagline: string;
  items: string[];
};

function Step4({
  data, update, packages,
}: {
  data: QuoteFormData;
  update: (p: Partial<QuoteFormData>) => void;
  packages: PackageData[];
}) {
  // Interior selected → packages 1,2,3; otherwise → packages 4,5
  const available = data.interior
    ? packages.filter((p) => p.code <= 3)
    : packages.filter((p) => p.code >= 4);

  return (
    <div className="space-y-4">
      {available.length === 0 && (
        <p className="text-sm text-[var(--color-text-secondary)]">
          Loading packages…
        </p>
      )}
      {available.map((pkg) => (
        <button
          key={pkg.code}
          type="button"
          onClick={() => update({ package: String(pkg.code) })}
          className={`w-full border p-6 text-left transition-all duration-200 ${
            data.package === String(pkg.code)
              ? "border-[var(--color-main)] bg-[var(--color-bg)]"
              : "border-[var(--color-border)]/20 hover:border-[var(--color-main)]/40"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
                Package {pkg.code}
              </p>
              <p className="mt-1 font-serif text-xl text-[var(--color-body)]">
                {pkg.name}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {pkg.tagline}
              </p>
            </div>
            <div
              className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                data.package === String(pkg.code)
                  ? "border-[var(--color-main)] bg-[var(--color-main)]"
                  : "border-[var(--color-border)]/40"
              }`}
            />
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {pkg.items.map((s) => (
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
  const [data, setData] = useState<QuoteFormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  // Fix 3: Separate honeypot state, not part of QuoteFormData.
  const [honeypot, setHoneypot] = useState("");
  const [packages, setPackages] = useState<PackageData[]>([]);
  const partialSentRef = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { step: number; data: QuoteFormData };
        setData(parsed.data);
        setStep(parsed.step);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetch("/api/packages")
      .then((r) => r.json())
      .then((pkgs: PackageData[]) => setPackages(pkgs))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (submitted) return;
    localStorage.setItem(LS_KEY, JSON.stringify({ step, data }));
  }, [step, data, submitted]);

  function update(patch: Partial<QuoteFormData>) {
    setData((prev) => {
      const next = { ...prev, ...patch };
      // Reset package selection when interior scope changes
      if ("interior" in patch && patch.interior !== prev.interior) {
        next.package = "";
      }
      return next;
    });
  }

  // Fix 7: Consolidated sendPartial + sendProgressUpdate into sendToApi.
  // When isFirstSave is true the partialSentRef guard is applied so only the
  // first forward-step from step 0 fires once per session.
  async function sendToApi(formData: QuoteFormData, isFirstSave: boolean) {
    if (isFirstSave) {
      if (partialSentRef.current) return;
      partialSentRef.current = true;
    }
    try {
      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Fix 3: honeypot included in every POST body.
        body: JSON.stringify({ ...formData, partial: true, honeypot }),
      });
    } catch {}
  }

  async function handleNext() {
    setDirection(1);
    if (step === 0) {
      sendToApi(data, true);
    } else if (step > 0 && step < 3) {
      sendToApi(data, false);
    }
    setStep((s) => s + 1);
  }

  function handleBack() {
    setDirection(-1);
    // Fix 6: Reset partialSentRef so if the user edits their email and advances
    // again a new partial save fires with the updated data.
    if (step === 1) partialSentRef.current = false;
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Fix 3: honeypot included in final POST body.
        body: JSON.stringify({ ...data, partial: false, honeypot }),
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

  return (
    <div className="rounded-sm bg-[var(--color-container)] p-8 lg:p-12">
      <StepIndicator current={step} />

      <p className="mb-8 text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
        Step {step + 1} of {TOTAL_STEPS} — {STEP_LABELS[step]}
      </p>

      {/* Fix 3: Hidden honeypot field. Real users never see or fill this. */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        style={{ display: "none" }}
      />

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
          {step === 3 && <Step4 data={data} update={update} packages={packages} />}
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
