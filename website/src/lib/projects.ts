import fs from "fs";
import path from "path";

export interface Project {
  slug: string;
  title: string;
  year: string;
  location: string;
  type: string[];
  shortDescription: string;
  images: string[];
  videos: string[];
  featured: boolean;
  order: number;
}

export function loadProjects(): Project[] {
  const contentDir = path.resolve(process.cwd(), "content/projects");
  if (!fs.existsSync(contentDir)) return [];

  const files = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".json"));

  const projects = files.map((file) => {
    const slug = file.replace(".json", "");
    const raw = JSON.parse(
      fs.readFileSync(path.join(contentDir, file), "utf-8")
    );
    return {
      slug,
      title: raw.title ?? "Untitled",
      year: raw.year ?? "",
      location: raw.location ?? "",
      type: Array.isArray(raw.type) ? raw.type : [],
      shortDescription: raw.shortDescription ?? "",
      images: Array.isArray(raw.images) ? raw.images : [],
      videos: Array.isArray(raw.videos) ? raw.videos : [],
      featured: raw.featured ?? false,
      order: raw.order ?? 99,
    } as Project;
  });

  return projects.sort((a, b) => a.order - b.order);
}

export function getProject(slug: string): Project | undefined {
  return loadProjects().find((p) => p.slug === slug);
}

export function getProjectSlugs(): string[] {
  return loadProjects().map((p) => p.slug);
}
