import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Architecture, interior design, and renovation services by Gozu Studio. Luxury residential and commercial projects across London and Europe.",
};

const SERVICES = [
  {
    title: "Residential Architecture",
    description:
      "Bespoke homes designed around how you live. From new-build houses to luxury apartments, we create residential architecture that combines aesthetic refinement with practical intelligence. Every project is a unique response to site, client, and context.",
    features: [
      "New-build residential design",
      "Planning & building regulations",
      "Sustainable design integration",
      "Project management",
    ],
  },
  {
    title: "Interior Design",
    description:
      "Considered interiors that transform how spaces feel. We work with material, light, and proportion to create environments that are both beautiful and deeply functional. From concept to completion, every detail is intentional.",
    features: [
      "Full interior design service",
      "Material & finish selection",
      "Bespoke furniture design",
      "Lighting design",
    ],
  },
  {
    title: "Renovation & Restoration",
    description:
      "Thoughtful transformation of existing buildings. We specialise in giving new life to period properties and heritage structures, preserving their character while introducing contemporary clarity and comfort.",
    features: [
      "Period property renovation",
      "Heritage building restoration",
      "Extension design",
      "Structural modifications",
    ],
  },
  {
    title: "Commercial Interiors",
    description:
      "Workspaces and commercial environments that elevate brands. We design offices, retail spaces, and hospitality interiors that align physical space with business identity and culture.",
    features: [
      "Office & workspace design",
      "Retail interiors",
      "Hospitality design",
      "Brand-aligned environments",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-6 pb-16 pt-32 lg:px-12 lg:pt-40">
        <div className="mx-auto max-w-[1400px]">
          <FadeIn>
            <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
              What We Do
            </p>
            <h1 className="mt-4 font-serif text-5xl text-[var(--color-body)] md:text-7xl">
              Our Services
            </h1>
            <p className="mt-6 max-w-xl text-lg text-[var(--color-text-secondary)]">
              From initial concept to final detail, we provide comprehensive
              architecture and design services tailored to each client and
              project.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Services List */}
      <section className="px-6 pb-24 lg:px-12 lg:pb-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="space-y-20">
            {SERVICES.map((service, i) => (
              <FadeIn key={service.title} delay={i * 0.08}>
                <div className="grid gap-12 border-t border-[var(--color-border)]/20 pt-12 lg:grid-cols-2 lg:gap-20">
                  <div>
                    <span className="font-serif text-2xl text-[var(--color-main)]">
                      0{i + 1}
                    </span>
                    <h2 className="mt-4 font-serif text-3xl text-[var(--color-body)] md:text-4xl">
                      {service.title}
                    </h2>
                  </div>
                  <div>
                    <p className="text-lg leading-relaxed text-[var(--color-text-secondary)]">
                      {service.description}
                    </p>
                    <ul className="mt-8 space-y-3">
                      {service.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-3 text-sm text-[var(--color-text)]"
                        >
                          <span className="h-[1px] w-4 bg-[var(--color-main)]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-[var(--color-body)]">
        <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
          <FadeIn>
            <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-main)]">
              Process
            </p>
            <h2 className="mt-4 font-serif text-4xl text-white/90 md:text-5xl">
              From Vision to Reality
            </h2>
          </FadeIn>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Consultation", desc: "We discuss your vision, requirements, and budget." },
              { step: "02", title: "Concept", desc: "Initial design concepts, mood boards, and spatial planning." },
              { step: "03", title: "Development", desc: "Detailed drawings, material selection, and contractor coordination." },
              { step: "04", title: "Completion", desc: "On-site oversight through to handover and final styling." },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.1}>
                <div className="border-t border-white/10 pt-8">
                  <span className="font-serif text-2xl text-[var(--color-main)]">
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-lg font-medium text-white/80">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/40">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center lg:px-12">
        <FadeIn>
          <h2 className="font-serif text-3xl text-[var(--color-body)] md:text-4xl">
            Ready to start your project?
          </h2>
          <Link
            href="/quote"
            className="mt-8 inline-block border border-[var(--color-main)] px-10 py-3 text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-body)] transition-all duration-300 hover:bg-[var(--color-main)] hover:text-white"
          >
            Request a Quote
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
