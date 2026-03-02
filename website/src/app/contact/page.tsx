import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";
import { SITE, SOCIAL_LINKS } from "@/lib/constants";
import ContactForm from "@/components/sections/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Gozu Studio. Architecture and interior design consultations in London, Vilnius, and across Europe.",
};

export default function ContactPage() {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.phone,
    address: [
      {
        "@type": "PostalAddress",
        addressLocality: "London",
        addressCountry: "GB",
      },
      {
        "@type": "PostalAddress",
        addressLocality: "Vilnius",
        addressCountry: "LT",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      {/* Hero */}
      <section className="px-6 pb-16 pt-32 lg:px-12 lg:pt-40">
        <div className="mx-auto max-w-[1400px]">
          <FadeIn>
            <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
              Contact
            </p>
            <h1 className="mt-4 font-serif text-5xl text-[var(--color-body)] md:text-7xl">
              Get in Touch
            </h1>
            <p className="mt-6 max-w-xl text-lg text-[var(--color-text-secondary)]">
              We would love to hear about your project. Reach out and let&apos;s
              start a conversation.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="px-6 pb-24 lg:px-12 lg:pb-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* Contact Info */}
            <FadeIn>
              <div className="space-y-12">
                <div>
                  <h2 className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
                    Email
                  </h2>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="mt-2 block font-serif text-2xl text-[var(--color-body)] transition-colors duration-300 hover:text-[var(--color-main)]"
                  >
                    {SITE.email}
                  </a>
                </div>

                <div>
                  <h2 className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
                    Phone / WhatsApp / Telegram
                  </h2>
                  <a
                    href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}
                    className="mt-2 block font-serif text-2xl text-[var(--color-body)] transition-colors duration-300 hover:text-[var(--color-main)]"
                  >
                    {SITE.phone}
                  </a>
                </div>

                <div>
                  <h2 className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
                    Locations
                  </h2>
                  {SITE.locations.map((loc) => (
                    <p key={loc} className="mt-2 text-lg text-[var(--color-text)]">
                      {loc}
                    </p>
                  ))}
                </div>

                <div>
                  <h2 className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
                    Social
                  </h2>
                  <div className="mt-4 flex gap-4">
                    {SOCIAL_LINKS.filter((s) => s.href !== "#").map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)]/20 transition-all duration-300 hover:border-[var(--color-main)] hover:bg-[var(--color-main)]"
                      >
                        <Image
                          src={social.icon}
                          alt={social.name}
                          width={18}
                          height={18}
                          className="opacity-60 transition-opacity hover:opacity-100"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Contact Form */}
            <FadeIn delay={0.15}>
              <ContactForm />
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
