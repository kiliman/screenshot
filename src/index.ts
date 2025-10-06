import { chromium } from "playwright";
import { basename, resolve } from "node:path";
import { existsSync } from "node:fs";

export interface ScreenshotOptions {
  width?: number;
  height?: number;
  format?: "png" | "jpg" | "jpeg";
  outdir?: string;
  quality?: number;
}

export async function generateScreenshot(
  htmlFile: string,
  outputFile?: string,
  options: ScreenshotOptions = {}
): Promise<string> {
  const width = options.width || 1280;
  const height = options.height || 720;
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
