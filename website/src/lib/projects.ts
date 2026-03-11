import fs from "fs";
import path from "path";

export interface Project {
  slug: string;
  title: string;
  year: string;
  location: string;
  type: string[];
  collaborations: string;
  shortDescription: string;
  images: string[];
  videos: string[];
  featured: boolean;
  order: number;
}

export function loadProjects(locale?: string): Project[] {
  const contentDir = path.resolve(process.cwd(), "content/projects");
  if (!fs.existsSync(contentDir)) return [];

  const translatedDir =
    locale && locale !== "en"
      ? path.resolve(process.cwd(), `content/translated/${locale}/projects`)
      : null;

  const files = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".json"));

  const projects = files.map((file) => {
    const slug = file.replace(".json", "");

    // Always read English source (authoritative for non-translatable fields)
    const englishRaw = JSON.parse(
      fs.readFileSync(path.join(contentDir, file), "utf-8")
    );

    // Merge translated text fields with English non-translatable fields
    let raw = englishRaw;
    if (translatedDir && fs.existsSync(path.join(translatedDir, file))) {
      const translatedRaw = JSON.parse(
        fs.readFileSync(path.join(translatedDir, file), "utf-8")
      );
      raw = {
        ...translatedRaw,
        // Always use English source for non-translatable fields
        images: englishRaw.images,
        videos: englishRaw.videos,
        year: englishRaw.year,
        order: englishRaw.order,
        featured: englishRaw.featured,
        collaborations: englishRaw.collaborations,
      };
    }

    return {
      slug,
      title: raw.title ?? "Untitled",
      year: raw.year ?? "",
      location: raw.location ?? "",
      type: Array.isArray(raw.type) ? raw.type : [],
      collaborations: raw.collaborations ?? "",
      shortDescription: raw.shortDescription ?? "",
      images: Array.isArray(raw.images) ? raw.images : [],
      videos: Array.isArray(raw.videos) ? raw.videos : [],
      featured: raw.featured ?? false,
      order: raw.order ?? 99,
    } as Project;
  });

  return projects.sort((a, b) => a.order - b.order);
}

export function getProject(slug: string, locale?: string): Project | undefined {
  return loadProjects(locale).find((p) => p.slug === slug);
}

export function getProjectSlugs(): string[] {
  return loadProjects().map((p) => p.slug);
}
