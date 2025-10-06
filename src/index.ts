import { chromium } from "playwright";
import { basename, resolve } from "node:path";
import { existsSync } from "node:fs";

export type SizePreset = "github" | "og" | "twitter" | "instagram" | "hd" | "4k";

export const SIZE_PRESETS: Record<SizePreset, { width: number; height: number }> = {
  github: { width: 1280, height: 640 },
  og: { width: 1200, height: 630 },
  twitter: { width: 1200, height: 675 },
  instagram: { width: 1080, height: 1080 },
  hd: { width: 1920, height: 1080 },
  "4k": { width: 3840, height: 2160 },
};

export interface ScreenshotOptions {
  width?: number;
  height?: number;
  size?: SizePreset;
  format?: "png" | "jpg" | "jpeg";
  outdir?: string;
  quality?: number;
}

export async function generateScreenshot(
  htmlFile: string,
  outputFile?: string,
  options: ScreenshotOptions = {}
): Promise<string> {
  // Apply size preset if provided
  const presetSize = options.size ? SIZE_PRESETS[options.size] : null;
  const width = options.width ?? presetSize?.width ?? 1280;
  const height = options.height ?? presetSize?.height ?? 720;
  const format = options.format || "png";
  const quality = options.quality || 85;

  // Resolve input file path
  const htmlPath = resolve(htmlFile);

  if (!existsSync(htmlPath)) {
    throw new Error(`HTML file not found: ${htmlPath}`);
  }

  // Determine output file path
  const defaultOutputFile = `${basename(htmlFile, ".html")}.${format}`;
  const outputFileName = outputFile || defaultOutputFile;
  const outputPath = options.outdir
    ? resolve(options.outdir, outputFileName)
    : resolve(outputFileName);

  console.log(`Generating ${outputFileName} (${width}x${height})...`);

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 2, // 2x for retina quality
  });

  console.log(`Loading ${htmlFile}...`);
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });

  console.log("Taking screenshot...");
  await page.screenshot({
    path: outputPath,
    type: format === "jpg" ? "jpeg" : format,
    ...(format === "jpg" || format === "jpeg" ? { quality } : {}),
  });

  await browser.close();
  console.log(`✅ Generated: ${outputPath}`);

  return outputPath;
}
