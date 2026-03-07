import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { loadProjects, getProject, getProjectSlugs } from "@/lib/projects";
import FadeIn from "@/components/ui/FadeIn";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const slugs = getProjectSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProject(slug, locale);
  if (!project) return { title: "Project Not Found" };

  return {
    title: project.title,
    description: project.shortDescription,
    openGraph: {
      title: `${project.title} | Gozu Studio`,
      description: project.shortDescription,
      images: project.images[0] ? [{ url: project.images[0] }] : [],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  const project = getProject(slug, locale);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--color-text-secondary)]">Project not found.</p>
      </div>
    );
  }

  const allProjects = loadProjects(locale);
  const currentIndex = allProjects.findIndex((p) => p.slug === slug);
  const nextProject = allProjects[(currentIndex + 1) % allProjects.length];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.shortDescription,
    dateCreated: project.year,
    locationCreated: {
      "@type": "Place",
      name: project.location,
    },
    creator: {
      "@type": "Organization",
      name: "Gozu Studio",
    },
    image: project.images.map(
      (img) => `https://www.gozustudio.com${img}`
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Image */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <Image
          src={project.images[0] || "/images/gozustudio-logo.svg"}
          alt={project.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: "linear-gradient(to bottom, transparent, var(--color-bg))",
          }}
        />
      </section>

      {/* Project Info */}
      <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-12">
        <FadeIn>
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h1 className="font-serif text-5xl text-[var(--color-body)] md:text-6xl">
                {project.title}
              </h1>
              <p className="mt-8 text-lg leading-relaxed text-[var(--color-text-secondary)]">
                {project.shortDescription}
              </p>
            </div>
            <div className="space-y-6 border-t border-[var(--color-border)]/20 pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              {[
                { label: t("yearLabel"), value: project.year },
                { label: t("locationLabel"), value: project.location },
                { label: t("typeLabel"), value: project.type.join(", ") },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[var(--color-body)]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Image Gallery */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24 lg:px-12">
        <div className="space-y-6">
          {project.images.slice(1).map((img, i) => (
            <FadeIn key={img} delay={i * 0.05}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={img}
                  alt={`${project.title} — Image ${i + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1400px) 100vw, 1400px"
                />
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Video Section */}
        {project.videos.length > 0 && (
          <div className="mt-6 space-y-6">
            {project.videos.map((video, i) => (
              <FadeIn key={video} delay={0.1}>
                <video
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full"
                  poster={project.images[i] || project.images[0]}
                >
                  <source src={video} type="video/mp4" />
                </video>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      {/* Next Project */}
      {nextProject && nextProject.slug !== slug && (
        <section className="border-t border-[var(--color-border)]/20">
          <Link
            href={`/projects/${nextProject.slug}`}
            className="group block"
          >
            <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-12">
              <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-label)]">
                {t("nextProject")}
              </p>
              <h2 className="mt-4 font-serif text-4xl text-[var(--color-body)] transition-colors duration-300 group-hover:text-[var(--color-main)] md:text-5xl">
                {nextProject.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                {nextProject.location} &middot; {nextProject.year}
              </p>
            </div>
          </Link>
        </section>
      )}
    </>
  );
}
