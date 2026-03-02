import fs from "fs";
import path from "path";

export interface Project {
  slug: string;
  title: string;
  year: string;
  location: string;
  type: string;
  shortDescription: string;
  images: string[];
  videos: string[];
}

function parseProjectInfo(content: string): Omit<Project, "slug" | "images" | "videos"> {
  const fields: Record<string, string> = {};

  const patterns: Record<string, string> = {
    title: "Title",
    year: "Year",
    location: "Location",
    type: "Type",
    shortDescription: "Short Description",
  };

  for (const [key, label] of Object.entries(patterns)) {
    const regex = new RegExp(`${label}:\\s*"([^"]*)"`, "i");
    const match = content.match(regex);
    if (match) {
      fields[key] = match[1];
    }
  }

  return {
    title: fields.title || "Untitled",
    year: fields.year || "",
    location: fields.location || "",
    type: fields.type || "",
    shortDescription: fields.shortDescription || "",
  };
}

function getMediaFiles(dir: string, extensions: string[]): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => extensions.some((ext) => f.toLowerCase().endsWith(ext)))
    .sort((a, b) => {
      if (a.startsWith("Main")) return -1;
      if (b.startsWith("Main")) return 1;
      const numA = parseInt(a) || 999;
      const numB = parseInt(b) || 999;
      return numA - numB;
    });
}

export function loadProjects(): Project[] {
  const projectsDir = path.resolve(process.cwd(), "..", "Projects");

  if (!fs.existsSync(projectsDir)) return [];

  const folders = fs.readdirSync(projectsDir).filter((f) => {
    return fs.statSync(path.join(projectsDir, f)).isDirectory();
  });

  const projects: Project[] = [];

  for (const folder of folders) {
    const infoPath = path.join(projectsDir, folder, "ProjectInfo.txt");
    if (!fs.existsSync(infoPath)) continue;

    const content = fs.readFileSync(infoPath, "utf-8");
    const info = parseProjectInfo(content);

    const imagesDir = path.join(projectsDir, folder, "Images");
    const videosDir = path.join(projectsDir, folder, "Videos");

    const imageFiles = getMediaFiles(imagesDir, [".jpg", ".jpeg", ".png", ".webp"]);
    const videoFiles = getMediaFiles(videosDir, [".mp4", ".webm"]);

    const slug = folder.toLowerCase() === "main" ? "main" : folder;

    projects.push({
      slug,
      ...info,
      images: imageFiles.map((f) => `/projects/${folder}/images/${f}`),
      videos: videoFiles.map((f) => `/projects/${folder}/videos/${f}`),
    });
  }

  // Sort: Main first, then by number
  return projects.sort((a, b) => {
    if (a.slug === "main") return -1;
    if (b.slug === "main") return 1;
    return parseInt(a.slug) - parseInt(b.slug);
  });
}

export function getProject(slug: string): Project | undefined {
  return loadProjects().find((p) => p.slug === slug);
}

export function getProjectSlugs(): string[] {
  return loadProjects().map((p) => p.slug);
}
