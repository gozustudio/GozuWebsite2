import fs from "fs";
import path from "path";

export function loadTranslatedContent<T>(
  relPath: string,
  locale: string
): T {
  // Try translated version for non-English locales
  if (locale && locale !== "en") {
    const translatedPath = path.resolve(
      process.cwd(),
      `content/translated/${locale}/${relPath}`
    );
    if (fs.existsSync(translatedPath)) {
      return JSON.parse(fs.readFileSync(translatedPath, "utf-8")) as T;
    }
  }

  // Fall back to English source
  const englishPath = path.resolve(process.cwd(), `content/${relPath}`);
  return JSON.parse(fs.readFileSync(englishPath, "utf-8")) as T;
}
