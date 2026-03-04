import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Gozu Studio is a luxury architecture and interior design practice founded by Goda Zukaite, creating refined spaces across Europe.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-6 pb-16 pt-32 lg:px-12 lg:pt-40">
        <div className="mx-auto max-w-[1400px]">
          <FadeIn>
            <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
              About
            </p>
            <h1 className="mt-4 font-serif text-5xl text-[var(--color-body)] md:text-7xl">
              The Studio
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
                Gozu Studio is a multidisciplinary architecture and interior
                design practice creating refined, considered spaces for
                discerning clients across Europe. Founded by {SITE.founder},
                our work bridges diverse cultural traditions with a distinctive
                European sensibility.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-lg leading-relaxed text-[var(--color-text-secondary)]">
                We believe that architecture should be an act of listening — to
                the site, to the client, to the way light moves through a room.
                Our projects begin with deep understanding and evolve into
                spaces that feel both inevitable and surprising.
              </p>
              <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-secondary)]">
                We serve clients throughout Europe, working remotely and
                on-site to bring each project to life. Our portfolio spans
                luxury residences, commercial interiors, and heritage renovations.
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
                Founder
              </p>
              <h2 className="mt-4 font-serif text-4xl text-white/90 md:text-5xl">
                {SITE.founder}
              </h2>
              <p className="mt-8 text-lg leading-relaxed text-white/50">
                Goda Zukaite founded Gozu Studio with a vision to create
                architecture that balances sophistication with warmth. With a
                background spanning both Baltic and British design traditions,
                she brings a distinctive perspective to every project — one
                that values restraint, materiality, and the quiet power of
                thoughtful space.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="space-y-8 border-t border-white/10 pt-8 lg:mt-16">
                {[
                  { label: "Education", value: "Architecture & Design" },
                  { label: "Practice", value: "Gozu Studio" },
                  {
                    label: "Expertise",
                    value: "Residential, Interior Design, Renovation",
                  },
                  { label: "Region", value: "Europe" },
                ].map((item) => (
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
              Our Approach
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[var(--color-body)] md:text-5xl">
              How We Work
            </h2>
          </FadeIn>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Listen",
                desc: "Every project starts with deep conversation. We learn how you live, what you value, and what the site tells us.",
              },
              {
                step: "02",
                title: "Design",
                desc: "We develop concepts that respond to context, light, and proportion — iterating until every detail serves the whole.",
              },
              {
                step: "03",
                title: "Deliver",
                desc: "From planning permissions to final finishes, we guide the project to completion with precision and care.",
              },
            ].map((item, i) => (
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
            Let&apos;s create something together.
          </h2>
          <Link
            href="/contact"
            className="mt-8 inline-block border border-[var(--color-main)] px-10 py-3 text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-body)] transition-all duration-300 hover:bg-[var(--color-main)] hover:text-white"
          >
            Get in Touch
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
