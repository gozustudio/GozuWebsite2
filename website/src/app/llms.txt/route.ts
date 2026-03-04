import { loadProjects } from "@/lib/projects";

export async function GET() {
  const projects = loadProjects();

  const projectLinks = projects
    .map(
      (p) =>
        `- [${p.title}](https://www.gozustudio.com/projects/${p.slug}): ${p.type} project in ${p.location} (${p.year})`
    )
    .join("\n");

  const content = `# Gozu Studio

> Gozu Studio is a luxury architecture and interior design practice founded by Goda Zukaite. We create refined residential and commercial spaces across Europe.

## Main Pages

- [Home](https://www.gozustudio.com/): Featured projects, studio introduction, and services overview
- [Projects](https://www.gozustudio.com/projects): Full portfolio of architecture and interior design projects
- [About](https://www.gozustudio.com/about): Studio history, founder Goda Zukaite, and design approach
- [Services](https://www.gozustudio.com/services): Residential architecture, interior design, renovation, and commercial interiors
- [Contact](https://www.gozustudio.com/contact): Contact information, email, phone, and social media links
- [Request a Quote](https://www.gozustudio.com/quote): Get a personalised project estimate

## Projects

${projectLinks}

## Contact Information

- Email: info@gozustudio.com
- WhatsApp: https://wa.me/4407765577275
- Telegram: https://t.me/+4407765577275
- Instagram: https://www.instagram.com/gozustudio/

## Services Offered

- Residential Architecture (new-build homes, luxury apartments)
- Interior Design (full-service, bespoke furniture, lighting)
- Renovation & Restoration (period properties, heritage buildings)
- Commercial Interiors (offices, retail, hospitality)

## Optional

- [Privacy Policy](https://www.gozustudio.com/privacy): Data protection and privacy statement
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
