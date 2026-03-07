import FadeIn from "@/components/ui/FadeIn";
import { loadTranslatedContent } from "@/lib/content";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Gozu Studio privacy statement and data protection policy.",
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");

  let privacyContent = "Privacy policy content not available.";
  try {
    const json = loadTranslatedContent<{ content: string }>("settings/privacy.json", locale);
    privacyContent = json.content ?? privacyContent;
  } catch {
    // File not found — use fallback
  }

  const paragraphs = privacyContent
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="px-6 pb-24 pt-32 lg:px-12 lg:pt-40">
      <div className="mx-auto max-w-[800px]">
        <FadeIn>
          <h1 className="font-serif text-5xl text-[var(--color-body)] md:text-6xl">
            {t("title")}
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-12 space-y-6">
            {paragraphs.map((paragraph, i) => {
              if (i === 0) {
                return (
                  <h2
                    key={i}
                    className="font-serif text-2xl text-[var(--color-body)]"
                  >
                    {paragraph}
                  </h2>
                );
              }
              return (
                <p
                  key={i}
                  className="text-base leading-relaxed text-[var(--color-text-secondary)]"
                >
                  {paragraph}
                </p>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
