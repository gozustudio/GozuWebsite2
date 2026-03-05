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

export function loadColors(): ColorPalette {
  const filePath = path.resolve(
    process.cwd(),
    "content/settings/colors.json"
  );
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as ColorPalette;
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
