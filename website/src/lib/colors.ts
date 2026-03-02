import fs from "fs";
import path from "path";

export interface ColorPalette {
  main: string;
  highlight: string;
  background: string;
  text: string;
  textSecondary: string;
  label: string;
  container: string;
  border: string;
  body: string;
  success: string;
  error: string;
  autofillBoxShadow: string;
}

const KEY_MAP: Record<string, keyof ColorPalette> = {
  "Main Colour": "main",
  "Highlight Colour": "highlight",
  "Background Colour": "background",
  "Text Colour": "text",
  "Secondary Text Colour": "textSecondary",
  "Label Colour": "label",
  "Container Background": "container",
  "Bar Border Colour": "border",
  "Bs Body Colour": "body",
  "Success Colour": "success",
  "Unsuccess Colour": "error",
  "Autofill Box Shadow": "autofillBoxShadow",
};

export function loadColors(): ColorPalette {
  const filePath = path.resolve(
    process.cwd(),
    "..",
    "Settings",
    "ColourPalette.txt"
  );
  const content = fs.readFileSync(filePath, "utf-8");

  const palette: Partial<ColorPalette> = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const rawKey = trimmed.slice(0, colonIdx).trim();
    const rawValue = trimmed
      .slice(colonIdx + 1)
      .trim()
      .replace(/;$/, "")
      .trim();

    const paletteKey = KEY_MAP[rawKey];
    if (paletteKey) {
      palette[paletteKey] = rawValue;
    }
  }

  return palette as ColorPalette;
}

export function colorsToCSS(palette: ColorPalette): string {
  return `
    --color-main: ${palette.main};
    --color-highlight: ${palette.highlight};
    --color-bg: ${palette.background};
    --color-text: ${palette.text};
    --color-text-secondary: ${palette.textSecondary};
    --color-label: ${palette.label};
    --color-container: ${palette.container};
    --color-border: ${palette.border};
    --color-body: ${palette.body};
    --color-success: ${palette.success};
    --color-error: ${palette.error};
    --color-autofill-shadow: ${palette.autofillBoxShadow};
  `.trim();
}
