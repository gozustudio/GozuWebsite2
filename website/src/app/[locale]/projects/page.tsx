import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { loadProjects } from "@/lib/projects";
import FadeIn from "@/components/ui/FadeIn";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore our portfolio of luxury residential and commercial architecture projects across Europe.",
};

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  const projects = loadProjects(locale);

  return (
    <>
      <script
        type="application/json"
        id="webmcp"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            tools: [
              {
                name: "search_gozu_projects",
                type: "imperative",
                description: "Search and filter Gozu Studio's architecture and interior design portfolio.",
                readOnly: true,
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

      {/* Project Grid */}
      <section className="px-6 pb-24 lg:px-12 lg:pb-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-8 md:grid-cols-2">
            {projects.map((project, i) => (
              <FadeIn
                key={project.slug}
                delay={i * 0.06}
                className={i === 0 ? "md:col-span-2" : ""}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="group block"
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
                      sizes={
                        i === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"
                      }
                    />
                    <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/20" />
                  </div>
                  <div className="mt-4 flex items-start justify-between">
                    <div>
                      <h2 className="font-serif text-xl text-[var(--color-body)] md:text-2xl">
                        {project.title}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {project.location} &middot; {project.type.join(", ")}
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
        </div>
      </section>
    </>
  );
}
