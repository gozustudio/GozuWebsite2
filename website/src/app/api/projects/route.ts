import { NextResponse } from "next/server";
import { loadProjects } from "@/lib/projects";

export async function GET() {
  const projects = loadProjects().map((p) => ({
    slug: p.slug,
    title: p.title,
    year: p.year || undefined,
    location: p.location || undefined,
    type: p.type.length > 0 ? p.type : undefined,
    collaborations: p.collaborations || undefined,
    shortDescription: p.shortDescription,
    url: `https://www.gozustudio.com/projects/${p.slug}`,
    imageCount: p.images.length,
    videoCount: p.videos.length,
  }));

  return NextResponse.json(projects, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
