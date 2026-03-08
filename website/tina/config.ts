import { defineConfig } from "tinacms";

export default defineConfig({
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "main",
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      // ── Projects ──────────────────────────────────────────────────
      {
        name: "project",
        label: "Projects",
        path: "content/projects",
        format: "json",
        ui: {
          filename: {
            readonly: true,
            slugify: (values) =>
              values.title
                ? values.title.toLowerCase().replace(/\s+/g, "-")
                : "untitled",
          },
        },
        fields: [
          { name: "title", type: "string", label: "Title", required: true },
          { name: "year", type: "string", label: "Year" },
          { name: "location", type: "string", label: "Location" },
          {
            name: "type",
            type: "string",
            label: "Project Type",
            list: true,
            ui: { component: "tags" },
          },
          {
            name: "collaborations",
            type: "string",
            label: "Collaborations",
            description: "Optional. Credits for collaborators, partners, or other studios involved.",
            ui: { component: "textarea" },
          },
          {
            name: "shortDescription",
            type: "string",
            label: "Short Description",
            ui: { component: "textarea" },
          },
          { name: "images", type: "image", label: "Images", list: true },
          {
            name: "videos",
            type: "string",
            label: "Videos",
            list: true,
            description:
              "Upload video files via the media manager and paste the path here. Compress to under 80MB (use HandBrake).",
          },
          {
            name: "featured",
            type: "boolean",
            label: "Show on Home Page",
            description:
              "Feature this project in the Selected Works section on the home page.",
          },
          {
            name: "order",
            type: "number",
            label: "Display Order",
            description: "Lower number = shown first. Main project should be 1.",
          },
        ],
      },

      // ── Pages ─────────────────────────────────────────────────────
      {
        name: "homePage",
        label: "Home Page",
        path: "content/pages",
        format: "json",
        match: { include: "home" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            name: "heroTagline",
            type: "string",
            label: "Hero Tagline",
            description: "Large headline in the studio intro section.",
          },
          {
            name: "introText",
            type: "string",
            label: "Intro Paragraph",
            ui: { component: "textarea" },
          },
        ],
      },
      {
        name: "aboutPage",
        label: "About Page",
        path: "content/pages",
        format: "json",
        match: { include: "about" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            name: "introParagraph1",
            type: "string",
            label: "Intro — Paragraph 1",
            ui: { component: "textarea" },
          },
          {
            name: "introParagraph2",
            type: "string",
            label: "Intro — Paragraph 2",
            ui: { component: "textarea" },
          },
          {
            name: "introParagraph3",
            type: "string",
            label: "Intro — Paragraph 3",
            ui: { component: "textarea" },
          },
          {
            name: "founderBio",
            type: "string",
            label: "Founder Bio",
            ui: { component: "textarea" },
          },
          {
            name: "founderFacts",
            type: "object",
            label: "Founder Facts",
            list: true,
            ui: { itemProps: (item) => ({ label: item.label }) },
            fields: [
              { name: "label", type: "string", label: "Label" },
              { name: "value", type: "string", label: "Value" },
            ],
          },
          {
            name: "approachSteps",
            type: "object",
            label: "Approach Steps",
            list: true,
            ui: { itemProps: (item) => ({ label: item.title }) },
            fields: [
              { name: "step", type: "string", label: "Step Number (e.g. 01)" },
              { name: "title", type: "string", label: "Step Title" },
              {
                name: "desc",
                type: "string",
                label: "Step Description",
                ui: { component: "textarea" },
              },
            ],
          },
        ],
      },
      {
        name: "servicesPage",
        label: "Services Page",
        path: "content/pages",
        format: "json",
        match: { include: "services" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            name: "heroText",
            type: "string",
            label: "Hero Subtitle",
            ui: { component: "textarea" },
          },
          {
            name: "services",
            type: "object",
            label: "Services",
            list: true,
            ui: { itemProps: (item) => ({ label: item.title }) },
            fields: [
              { name: "title", type: "string", label: "Service Title" },
              {
                name: "description",
                type: "string",
                label: "Description",
                ui: { component: "textarea" },
              },
              {
                name: "features",
                type: "string",
                label: "Features",
                list: true,
              },
            ],
          },
          {
            name: "processSteps",
            type: "object",
            label: "Process Steps",
            list: true,
            ui: { itemProps: (item) => ({ label: item.title }) },
            fields: [
              { name: "step", type: "string", label: "Step Number (e.g. 01)" },
              { name: "title", type: "string", label: "Step Title" },
              {
                name: "desc",
                type: "string",
                label: "Step Description",
                ui: { component: "textarea" },
              },
            ],
          },
        ],
      },

      // ── Settings ──────────────────────────────────────────────────
      {
        name: "colors",
        label: "Color Palette",
        path: "content/settings",
        format: "json",
        match: { include: "colors" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { name: "main", type: "string", label: "Main (Gold)", ui: { component: "color" } },
          { name: "highlight", type: "string", label: "Highlight", ui: { component: "color" } },
          { name: "background", type: "string", label: "Background (Cream)", ui: { component: "color" } },
          { name: "text", type: "string", label: "Body Text", ui: { component: "color" } },
          { name: "textSecondary", type: "string", label: "Secondary Text", ui: { component: "color" } },
          { name: "label", type: "string", label: "Label Text", ui: { component: "color" } },
          { name: "container", type: "string", label: "Container Background", ui: { component: "color" } },
          { name: "border", type: "string", label: "Border", ui: { component: "color" } },
          { name: "body", type: "string", label: "Near-Black (Body)", ui: { component: "color" } },
          { name: "success", type: "string", label: "Success", ui: { component: "color" } },
          { name: "error", type: "string", label: "Error", ui: { component: "color" } },
          {
            name: "autofillBoxShadow",
            type: "string",
            label: "Autofill Box Shadow",
            description: "Usually 'transparent'",
          },
        ],
      },
      {
        name: "privacy",
        label: "Privacy Notice",
        path: "content/settings",
        format: "json",
        match: { include: "privacy" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            name: "content",
            type: "string",
            label: "Privacy Notice Text",
            description: "Separate paragraphs with a blank line.",
            ui: { component: "textarea" },
          },
        ],
      },
    ],
  },
});
