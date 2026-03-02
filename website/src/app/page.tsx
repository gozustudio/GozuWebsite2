import Image from "next/image";
import Link from "next/link";
import { loadProjects } from "@/lib/projects";
import { SITE } from "@/lib/constants";
import HeroVideo from "@/components/sections/HeroVideo";
import FadeIn from "@/components/ui/FadeIn";

export default function Home() {
  const projects = loadProjects();
  const featured = projects.slice(0, 6);

  return (
    <>
      {/* Cinematic Hero */}
      <HeroVideo />

      {/* Studio Intro */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <FadeIn>
            <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
              About the Studio
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-[var(--color-body)] md:text-5xl lg:text-6xl">
              Architecture that tells your story
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg leading-relaxed text-[var(--color-text-secondary)] lg:mt-16">
              Gozu Studio is a London-based luxury architecture and interior
              design practice founded by {SITE.founder}. We create spaces that
              balance refined aesthetics with functional living — from bespoke
              residences to considered commercial environments across Europe.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-block text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-body)] transition-colors duration-300 hover:text-[var(--color-main)]"
            >
              Learn More &rarr;
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Selected Works */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24 lg:px-12 lg:pb-32">
        <FadeIn>
          <div className="mb-16 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
                Portfolio
              </p>
              <h2 className="mt-4 font-serif text-4xl text-[var(--color-body)] md:text-5xl">
                Selected Works
              </h2>
            </div>
            <Link
              href="/projects"
              className="hidden text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-body)] transition-colors duration-300 hover:text-[var(--color-main)] md:block"
            >
              View All Projects &rarr;
            </Link>
          </div>
        </FadeIn>

        {/* Asymmetric Project Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {featured.map((project, i) => (
            <FadeIn
              key={project.slug}
              delay={i * 0.08}
              className={i === 0 ? "md:col-span-2" : ""}
            >
              <Link
                href={`/projects/${project.slug}`}
                className="group relative block overflow-hidden"
              >
                <div
                  className={`relative overflow-hidden ${
                    i === 0 ? "aspect-[16/8]" : "aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={project.images[0] || "/images/gozustudio-logo.svg"}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes={i === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                  />
                  <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/20" />
                </div>
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-xl text-[var(--color-body)] md:text-2xl">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {project.location}
                    </p>
                  </div>
                  <span className="text-sm text-[var(--color-label)]">
                    {project.year}
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link
            href="/projects"
            className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-body)] transition-colors duration-300 hover:text-[var(--color-main)]"
          >
            View All Projects &rarr;
          </Link>
        </div>
      </section>

      {/* Services Preview */}
      <section className="bg-[var(--color-body)]">
        <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
          <FadeIn>
            <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-main)]">
              What We Do
            </p>
            <h2 className="mt-4 font-serif text-4xl text-white/90 md:text-5xl">
              Our Services
            </h2>
          </FadeIn>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {[
              {
                title: "Architecture",
                desc: "From concept to completion — bespoke residential and commercial architecture that responds to context, light, and living.",
              },
              {
                title: "Interior Design",
                desc: "Considered interiors that harmonise material, proportion, and craft. Every detail serves the whole.",
              },
              {
                title: "Renovation",
                desc: "Thoughtful transformation of existing spaces — preserving character while introducing contemporary clarity.",
              },
            ].map((service, i) => (
              <FadeIn key={service.title} delay={i * 0.1}>
                <div className="border-t border-white/10 pt-8">
                  <h3 className="font-serif text-2xl text-white/80">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/40">
                    {service.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <div className="mt-16">
              <Link
                href="/services"
                className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-main)] transition-colors duration-300 hover:text-[var(--color-highlight)]"
              >
                Explore Services &rarr;
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
