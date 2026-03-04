"use client";

import { useEffect, useRef } from "react";

export default function WebMCPTools() {
  const registeredRef = useRef(false);

  useEffect(() => {
    const mc = navigator.modelContext;
    if (!mc || registeredRef.current) return;
    registeredRef.current = true;

    // Read-only tool: search projects
    mc.registerTool({
      name: "search_gozu_projects",
      description:
        "Search Gozu Studio's architecture and interior design portfolio. Returns a list of projects matching the query criteria.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Search term to match against project titles, locations, types, or descriptions",
          },
          type: {
            type: "string",
            description:
              "Filter by project type: 'Exterior', 'Interior', 'Renovations', or leave empty for all",
          },
        },
      },
      annotations: { readOnlyHint: true },
      execute: async () => {
        // Fetch project data from our API or static data
        const response = await fetch("/api/projects");
        const projects = await response.json();
        return projects;
      },
    });

    // Read-only tool: get studio info
    mc.registerTool({
      name: "get_gozu_studio_info",
      description:
        "Get information about Gozu Studio including contact details, services, and the founder.",
      inputSchema: {
        type: "object",
        properties: {},
      },
      annotations: { readOnlyHint: true },
      execute: async () => {
        return {
          name: "Gozu Studio",
          founder: "Goda Zukaite",
          description:
            "Luxury architecture and interior design studio. Creating refined residential and commercial spaces across Europe.",
          services: [
            "Residential Architecture",
            "Interior Design",
            "Renovation & Restoration",
            "Commercial Interiors",
          ],
          contact: {
            email: "info@gozustudio.com",
            whatsapp: "https://wa.me/4407765577275",
            telegram: "https://t.me/+4407765577275",
            website: "https://www.gozustudio.com",
            instagram: "https://www.instagram.com/gozustudio/",
          },
        };
      },
    });
  }, []);

  return null;
}
