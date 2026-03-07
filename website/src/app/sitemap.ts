import type { MetadataRoute } from "next";
import { loadProjects } from "@/lib/projects";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.gozustudio.com";
  const projects = loadProjects();

  function localeUrls(path: string): Record<string, string> {
    const urls: Record<string, string> = {};
    for (const locale of routing.locales) {
      urls[locale] = locale === "en" ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`;
    }
    return urls;
  }

  const staticPaths = [
    { path: "", priority: 1, freq: "weekly" as const },
    { path: "/projects", priority: 0.9, freq: "weekly" as const },
    { path: "/about", priority: 0.8, freq: "monthly" as const },
    { path: "/services", priority: 0.8, freq: "monthly" as const },
    { path: "/contact", priority: 0.7, freq: "monthly" as const },
    { path: "/quote", priority: 0.7, freq: "monthly" as const },
    { path: "/privacy", priority: 0.3, freq: "yearly" as const },
  ];

  const staticPages: MetadataRoute.Sitemap = staticPaths.map(({ path, priority, freq }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
    alternates: { languages: localeUrls(path) },
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
    alternates: { languages: localeUrls(`/projects/${project.slug}`) },
  }));

  return [...staticPages, ...projectPages];
}
