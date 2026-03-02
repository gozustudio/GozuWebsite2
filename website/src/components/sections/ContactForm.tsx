"use client";

import { useState, FormEvent } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nativeEvent = e.nativeEvent as WebMCPSubmitEvent;

    if (nativeEvent.agentInvoked) {
      const fd = new FormData(e.currentTarget);
      const ref = "REF-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      nativeEvent.respondWith?.(
        `Contact form submitted successfully. Reference: ${ref}. Name: ${fd.get("name")}, Email: ${fd.get("email")}.`
      );
      setSubmitted(true);
      return;
    }

    // Human submission — placeholder for backend integration
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-sm bg-[var(--color-container)] p-12">
        <div className="text-center">
          <p className="font-serif text-2xl text-[var(--color-body)]">
            Thank you for reaching out.
          </p>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            We&apos;ll be in touch within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      id="contactForm"
      onSubmit={handleSubmit}
      toolname="contact_gozu_studio"
      tooldescription="Send a contact message to Gozu Studio architecture and interior design firm. Use this to inquire about architecture projects, interior design services, or general questions."
      noValidate
      className="space-y-6 rounded-sm bg-[var(--color-container)] p-8 lg:p-12"
    >
      <div>
        <label
          htmlFor="contact-name"
          className="mb-2 block text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]"
        >
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          name="name"
          required
          toolparamdescription="Full name of the person contacting"
          className="w-full border-b border-[var(--color-border)]/20 bg-transparent py-3 text-[var(--color-body)] outline-none transition-colors focus:border-[var(--color-main)]"
          placeholder="Your name"
        />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="mb-2 block text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]"
        >
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          name="email"
          required
          toolparamdescription="Email address for follow-up communication"
          className="w-full border-b border-[var(--color-border)]/20 bg-transparent py-3 text-[var(--color-body)] outline-none transition-colors focus:border-[var(--color-main)]"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="mb-2 block text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]"
        >
          Subject
        </label>
        <select
          id="contact-subject"
          name="subject"
          toolparamdescription="Subject of the inquiry: 'architecture', 'interior-design', 'renovation', 'consultation', or 'other'"
          className="w-full border-b border-[var(--color-border)]/20 bg-transparent py-3 text-[var(--color-body)] outline-none transition-colors focus:border-[var(--color-main)]"
        >
          <option value="architecture">Architecture Project</option>
          <option value="interior-design">Interior Design</option>
          <option value="renovation">Renovation</option>
          <option value="consultation">General Consultation</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-2 block text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          toolparamdescription="Detailed message describing the project or inquiry"
          className="w-full resize-none border-b border-[var(--color-border)]/20 bg-transparent py-3 text-[var(--color-body)] outline-none transition-colors focus:border-[var(--color-main)]"
          placeholder="Tell us about your project..."
        />
      </div>

      <button
        type="submit"
        className="w-full border border-[var(--color-main)] bg-[var(--color-main)] py-4 text-[11px] font-medium uppercase tracking-[3px] text-white transition-all duration-300 hover:bg-transparent hover:text-[var(--color-body)]"
      >
        Send Message
      </button>
    </form>
  );
}
