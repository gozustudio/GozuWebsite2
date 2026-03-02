"use client";

import { useState, FormEvent } from "react";

export default function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nativeEvent = e.nativeEvent as WebMCPSubmitEvent;

    if (nativeEvent.agentInvoked) {
      const fd = new FormData(e.currentTarget);
      const ref = "QUOTE-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      nativeEvent.respondWith?.(
        `Quote request submitted. Reference: ${ref}. Project type: ${fd.get("projectType")}, Budget: ${fd.get("budget")}, Timeline: ${fd.get("timeline")}.`
      );
      setSubmitted(true);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-sm bg-[var(--color-container)] p-12">
        <div className="text-center">
          <p className="font-serif text-2xl text-[var(--color-body)]">
            Thank you for your request.
          </p>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            We&apos;ll review your project details and respond within 48 hours
            with a personalised estimate.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      id="quoteForm"
      onSubmit={handleSubmit}
      toolname="request_quote_gozu_studio"
      tooldescription="Request a project quote from Gozu Studio. Provide project type, location, approximate size, budget range, timeline, and a brief description to receive a personalised estimate for architecture or interior design services."
      noValidate
      className="space-y-8 rounded-sm bg-[var(--color-container)] p-8 lg:p-12"
    >
      {/* Name & Email */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="quote-name"
            className="mb-2 block text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]"
          >
            Name
          </label>
          <input
            id="quote-name"
            type="text"
            name="name"
            required
            toolparamdescription="Full name of the person requesting the quote"
            className="w-full border-b border-[var(--color-border)]/20 bg-transparent py-3 text-[var(--color-body)] outline-none transition-colors focus:border-[var(--color-main)]"
            placeholder="Your name"
          />
        </div>
        <div>
          <label
            htmlFor="quote-email"
            className="mb-2 block text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]"
          >
            Email
          </label>
          <input
            id="quote-email"
            type="email"
            name="email"
            required
            toolparamdescription="Email address to receive the quote"
            className="w-full border-b border-[var(--color-border)]/20 bg-transparent py-3 text-[var(--color-body)] outline-none transition-colors focus:border-[var(--color-main)]"
            placeholder="your@email.com"
          />
        </div>
      </div>

      {/* Project Type */}
      <div>
        <label
          htmlFor="quote-type"
          className="mb-2 block text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]"
        >
          Project Type
        </label>
        <select
          id="quote-type"
          name="projectType"
          required
          toolparamdescription="Type of project: 'new-build', 'renovation', 'interior-design', 'extension', or 'commercial'"
          className="w-full border-b border-[var(--color-border)]/20 bg-transparent py-3 text-[var(--color-body)] outline-none transition-colors focus:border-[var(--color-main)]"
        >
          <option value="">Select project type</option>
          <option value="new-build">New Build</option>
          <option value="renovation">Renovation</option>
          <option value="interior-design">Interior Design</option>
          <option value="extension">Extension</option>
          <option value="commercial">Commercial</option>
        </select>
      </div>

      {/* Location */}
      <div>
        <label
          htmlFor="quote-location"
          className="mb-2 block text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]"
        >
          Project Location
        </label>
        <input
          id="quote-location"
          type="text"
          name="location"
          required
          toolparamdescription="City and country where the project is located"
          className="w-full border-b border-[var(--color-border)]/20 bg-transparent py-3 text-[var(--color-body)] outline-none transition-colors focus:border-[var(--color-main)]"
          placeholder="e.g., London, UK"
        />
      </div>

      {/* Size & Budget */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="quote-size"
            className="mb-2 block text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]"
          >
            Approximate Size (sqm)
          </label>
          <input
            id="quote-size"
            type="text"
            name="size"
            toolparamdescription="Approximate project size in square metres"
            className="w-full border-b border-[var(--color-border)]/20 bg-transparent py-3 text-[var(--color-body)] outline-none transition-colors focus:border-[var(--color-main)]"
            placeholder="e.g., 200"
          />
        </div>
        <div>
          <label
            htmlFor="quote-budget"
            className="mb-2 block text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]"
          >
            Budget Range
          </label>
          <select
            id="quote-budget"
            name="budget"
            toolparamdescription="Budget range for the project: 'under-50k', '50k-100k', '100k-250k', '250k-500k', '500k-1m', or 'over-1m'"
            className="w-full border-b border-[var(--color-border)]/20 bg-transparent py-3 text-[var(--color-body)] outline-none transition-colors focus:border-[var(--color-main)]"
          >
            <option value="">Select budget range</option>
            <option value="under-50k">Under 50,000</option>
            <option value="50k-100k">50,000 - 100,000</option>
            <option value="100k-250k">100,000 - 250,000</option>
            <option value="250k-500k">250,000 - 500,000</option>
            <option value="500k-1m">500,000 - 1,000,000</option>
            <option value="over-1m">Over 1,000,000</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <label
          htmlFor="quote-timeline"
          className="mb-2 block text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]"
        >
          Desired Timeline
        </label>
        <select
          id="quote-timeline"
          name="timeline"
          toolparamdescription="Desired project timeline: 'asap', '3-6-months', '6-12-months', '12-plus-months', or 'flexible'"
          className="w-full border-b border-[var(--color-border)]/20 bg-transparent py-3 text-[var(--color-body)] outline-none transition-colors focus:border-[var(--color-main)]"
        >
          <option value="">Select timeline</option>
          <option value="asap">As soon as possible</option>
          <option value="3-6-months">3 - 6 months</option>
          <option value="6-12-months">6 - 12 months</option>
          <option value="12-plus-months">12+ months</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="quote-description"
          className="mb-2 block text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]"
        >
          Project Description
        </label>
        <textarea
          id="quote-description"
          name="description"
          required
          rows={5}
          toolparamdescription="Brief description of the project, including any specific requirements, style preferences, or key features desired"
          className="w-full resize-none border-b border-[var(--color-border)]/20 bg-transparent py-3 text-[var(--color-body)] outline-none transition-colors focus:border-[var(--color-main)]"
          placeholder="Tell us about your project vision, requirements, and any specific details..."
        />
      </div>

      <button
        type="submit"
        className="w-full border border-[var(--color-main)] bg-[var(--color-main)] py-4 text-[11px] font-medium uppercase tracking-[3px] text-white transition-all duration-300 hover:bg-transparent hover:text-[var(--color-body)]"
      >
        Submit Quote Request
      </button>

      <p className="text-center text-xs text-[var(--color-label)]">
        No commitment required. We typically respond within 48 hours.
      </p>
    </form>
  );
}
