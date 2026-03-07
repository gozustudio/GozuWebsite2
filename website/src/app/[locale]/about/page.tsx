import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/ui/FadeIn";
import { SITE } from "@/lib/constants";
import { loadTranslatedContent } from "@/lib/content";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "About",
  description:
    "Gozu Studio is a luxury architecture and interior design practice founded by Goda Zukaite, creating refined spaces across Europe.",
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const about = loadTranslatedContent<{
    introParagraph1: string;
    introParagraph2: string;
    introParagraph3: string;
    founderBio: string;
    founderFacts: { label: string; value: string }[];
    approachSteps: { step: string; title: string; desc: string }[];
  }>("pages/about.json", locale);

  return (
    <>
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
          </FadeIn>
        </div>
      </section>

      {/* Intro */}
      <section className="px-6 pb-24 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-16 lg:grid-cols-2">
            <FadeIn>
              <p className="text-xl leading-relaxed text-[var(--color-text-secondary)] lg:text-2xl">
                {about.introParagraph1}
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-lg leading-relaxed text-[var(--color-text-secondary)]">
                {about.introParagraph2}
              </p>
              <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-secondary)]">
                {about.introParagraph3}
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-[var(--color-body)]">
        <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-2">
            <FadeIn>
              <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-main)]">
                {t("founderLabel")}
              </p>
              <h2 className="mt-4 font-serif text-4xl text-white/90 md:text-5xl">
                {SITE.founder}
              </h2>
              <p className="mt-8 text-lg leading-relaxed text-white/50">
                {about.founderBio}
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="space-y-8 border-t border-white/10 pt-8 lg:mt-16">
                {about.founderFacts.map((item) => (
                  <div key={item.label}>
                    <p className="text-[11px] font-medium uppercase tracking-[3px] text-white/40">
                      {item.label}
                    </p>
                    <p className="mt-1 text-white/70">{item.value}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <FadeIn>
            <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
              {t("approachLabel")}
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[var(--color-body)] md:text-5xl">
              {t("approachTitle")}
            </h2>
          </FadeIn>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {about.approachSteps.map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.1}>
                <div className="border-t border-[var(--color-border)]/20 pt-8">
                  <span className="font-serif text-3xl text-[var(--color-main)]">
                    {item.step}
                  </span>
                  <h3 className="mt-4 font-serif text-2xl text-[var(--color-body)]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--color-border)]/20 px-6 py-20 text-center lg:px-12">
        <FadeIn>
          <h2 className="font-serif text-3xl text-[var(--color-body)] md:text-4xl">
            {t("cta")}
          </h2>
          <Link
            href="/contact"
            className="mt-8 inline-block border border-[var(--color-main)] px-10 py-3 text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-body)] transition-all duration-300 hover:bg-[var(--color-main)] hover:text-white"
          >
            {t("ctaButton")}
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
