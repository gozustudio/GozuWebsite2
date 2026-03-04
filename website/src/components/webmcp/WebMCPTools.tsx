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

    // Action tool: submit a quote request
    mc.registerTool({
      name: "request_quote_gozu_studio",
      description:
        "Submit a project quote request to Gozu Studio. This is a 4-step wizard form that collects contact details, project address, project specifications, and a service package selection. " +
        "Step 1 — Contact: email, firstName, lastName. " +
        "Step 2 — Address: countryCode (ISO 3166-1 alpha-2), countryName, state (optional), city, postcode (optional), streetName (optional), streetNumber (optional), apartment (optional). " +
        "Step 3 — Project Details: residential (bool), offices (bool), commercial (bool) — at least one must be true; " +
        "residentialSubtype — required when residential is true, one of: 'Single Family Property' | 'Multiple Family Property'; " +
        "interior (bool), exterior (bool), landscape (bool) — at least one must be true; " +
        "constructionType — one of: 'Renovation' | 'Construction from zero'; " +
        "demolition — one of: 'Yes' | 'No'; " +
        "area (positive number as string); " +
        "unit — one of: 'Square Metres' | 'Square Feet' (defaults to 'Square Metres'); " +
        "projectSite — one of: 'On-site' | 'Remote'; " +
        "completion — one of: 'As soon as possible' | '5\u20136 months' | '6\u201312 months'. " +
        "Step 4 — Package: package — one of: 'Standard' | 'Advance' | 'Premium'. " +
        "Standard includes all basic technical plans (partition, furniture, lighting, electrical, plumbing, ceiling, floor, ventilation, tile layout). " +
        "Advance adds 3D model, kitchen and furniture sketches, material and lighting selection, and remote consultations. " +
        "Premium adds ordered furniture and interior details selection plus 5 photorealistic visualisations.",
      inputSchema: {
        type: "object",
        required: [
          "email", "firstName", "lastName",
          "countryCode", "countryName", "city",
          "residential", "offices", "commercial",
          "interior", "exterior", "landscape",
          "constructionType", "demolition", "area", "unit",
          "projectSite", "completion",
          "package",
        ],
        properties: {
          // Step 1 — Contact
          email: {
            type: "string",
            description: "Client email address",
          },
          firstName: {
            type: "string",
            description: "Client first name",
          },
          lastName: {
            type: "string",
            description: "Client last name",
          },
          // Step 2 — Address
          countryCode: {
            type: "string",
            description: "ISO 3166-1 alpha-2 country code (e.g. 'GB', 'LT', 'DE')",
          },
          countryName: {
            type: "string",
            description: "Full country name matching the countryCode (e.g. 'United Kingdom')",
          },
          state: {
            type: "string",
            description: "State, county, or region (optional)",
          },
          city: {
            type: "string",
            description: "City or town",
          },
          postcode: {
            type: "string",
            description: "Postal or ZIP code (optional)",
          },
          streetName: {
            type: "string",
            description: "Street name (optional)",
          },
          streetNumber: {
            type: "string",
            description: "Street number (optional)",
          },
          apartment: {
            type: "string",
            description: "Apartment or unit identifier (optional)",
          },
          // Step 3 — Project Details: property type (at least one required)
          residential: {
            type: "boolean",
            description: "True if the project includes a residential property",
          },
          offices: {
            type: "boolean",
            description: "True if the project includes office spaces",
          },
          commercial: {
            type: "boolean",
            description: "True if the project includes commercial spaces",
          },
          residentialSubtype: {
            type: "string",
            enum: ["Single Family Property", "Multiple Family Property", ""],
            description:
              "Required when residential is true. One of: 'Single Family Property' | 'Multiple Family Property'",
          },
          // Step 3 — Project scope (at least one required)
          interior: {
            type: "boolean",
            description: "True if the project scope includes interior design",
          },
          exterior: {
            type: "boolean",
            description: "True if the project scope includes exterior / facade work",
          },
          landscape: {
            type: "boolean",
            description: "True if the project scope includes landscape design",
          },
          // Step 3 — Construction details
          constructionType: {
            type: "string",
            enum: ["Renovation", "Construction from zero"],
            description:
              "Type of construction: 'Renovation' for refurbishing an existing structure, 'Construction from zero' for a new build",
          },
          demolition: {
            type: "string",
            enum: ["Yes", "No"],
            description: "Whether demolition work is required: 'Yes' or 'No'",
          },
          area: {
            type: "string",
            description:
              "Total project area as a positive number string (e.g. '120')",
          },
          unit: {
            type: "string",
            enum: ["Square Metres", "Square Feet"],
            description:
              "Unit for the area measurement: 'Square Metres' (default) or 'Square Feet'",
          },
          projectSite: {
            type: "string",
            enum: ["On-site", "Remote"],
            description:
              "Whether the studio will work on-site or remotely. Remote projects require accurate existing plans.",
          },
          completion: {
            type: "string",
            enum: ["As soon as possible", "5\u20136 months", "6\u201312 months"],
            description:
              "Preferred project completion timeframe: 'As soon as possible', '5\u20136 months', or '6\u201312 months'",
          },
          // Step 4 — Package
          package: {
            type: "string",
            enum: ["Standard", "Advance", "Premium"],
            description:
              "Service package: 'Standard' (all basic technical plans), 'Advance' (adds 3D model, material selection, consultations), or 'Premium' (adds ordered furniture selection and 5 photorealistic visualisations)",
          },
        },
      },
      execute: async (input: Record<string, unknown>) => {
        const res = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...input, partial: false, honeypot: "" }),
        });
        if (!res.ok) {
          return { success: false, message: "Quote submission failed. Please try again or contact info@gozustudio.com." };
        }
        return {
          success: true,
          message:
            "Your quote request has been submitted successfully. Gozu Studio will review your project details and respond within 48 hours with a personalised estimate.",
        };
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
