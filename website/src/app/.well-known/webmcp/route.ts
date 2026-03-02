import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const manifest = {
    spec: "webmcp/0.1",
    site: {
      name: "Gozu Studio",
      version: "2026.03",
      description:
        "Luxury architecture and interior design studio based in London, UK. Browse projects, learn about services, and request quotes for residential and commercial design projects across Europe.",
      pages: [
        {
          url: "/",
          intents: ["browse_portfolio", "learn_about_studio"],
        },
        {
          url: "/projects",
          intents: ["browse_projects", "search_projects"],
        },
        {
          url: "/about",
          intents: ["learn_about_studio", "learn_about_founder"],
        },
        {
          url: "/services",
          intents: ["explore_services"],
        },
        {
          url: "/contact",
          intents: ["contact_gozu_studio"],
        },
        {
          url: "/quote",
          intents: ["request_quote_gozu_studio"],
        },
      ],
      flows: [
        {
          id: "get_quote",
          description:
            "Request a personalised quote for an architecture or interior design project by providing project details.",
          steps: [{ intent: "request_quote_gozu_studio", page: "/quote" }],
        },
        {
          id: "contact_studio",
          description:
            "Send a message to Gozu Studio to inquire about their architecture or interior design services.",
          steps: [{ intent: "contact_gozu_studio", page: "/contact" }],
        },
        {
          id: "browse_portfolio",
          description:
            "Browse the studio's architecture and interior design portfolio to see completed projects.",
          steps: [
            { intent: "browse_projects", page: "/projects" },
          ],
        },
      ],
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
