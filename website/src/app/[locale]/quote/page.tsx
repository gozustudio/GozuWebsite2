import FadeIn from "@/components/ui/FadeIn";
import QuoteForm from "@/components/sections/QuoteForm";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Get an instant quote for your architecture or interior design project from Gozu Studio. Tell us about your vision and receive a personalised estimate.",
};

export default async function QuotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("quote");

  return (
    <>
      <script
        type="application/json"
        id="webmcp"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            tools: [
              {
                name: "request_quote_gozu_studio",
                type: "imperative",
                description: "Submit a project quote request to Gozu Studio. Collects contact details, project address, specifications, and service package selection.",
              },
            ],
          }),
        }}
      />

      {/* Hero */}
      <section className="px-6 pb-16 pt-32 lg:px-12 lg:pt-40">
        <div className="mx-auto max-w-[1400px]">
          <FadeIn>
            <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
              {t("label")}
            </p>
            <h1 className="mt-4 font-serif text-5xl text-[var(--color-body)] md:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-[var(--color-text-secondary)]">
              {t("subtitle")}
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
