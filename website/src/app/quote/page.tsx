import FadeIn from "@/components/ui/FadeIn";
import QuoteForm from "@/components/sections/QuoteForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Get an instant quote for your architecture or interior design project from Gozu Studio. Tell us about your vision and receive a personalised estimate.",
};

export default function QuotePage() {
  return (
    <>
      {/* Hero */}
      <section className="px-6 pb-16 pt-32 lg:px-12 lg:pt-40">
        <div className="mx-auto max-w-[1400px]">
          <FadeIn>
            <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
              Get Started
            </p>
            <h1 className="mt-4 font-serif text-5xl text-[var(--color-body)] md:text-7xl">
              Request a Quote
            </h1>
            <p className="mt-6 max-w-xl text-lg text-[var(--color-text-secondary)]">
              Answer a few questions about your project and we&apos;ll provide a
              personalised estimate. No commitment required.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Quote Form */}
      <section className="px-6 pb-24 lg:px-12 lg:pb-32">
        <div className="mx-auto max-w-[800px]">
          <FadeIn>
            <QuoteForm />
          </FadeIn>
        </div>
      </section>
    </>
  );
}
