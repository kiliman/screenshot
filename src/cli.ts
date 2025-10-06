#!/usr/bin/env node

import {
  generateScreenshot,
  SIZE_PRESETS,
  type ScreenshotOptions,
  type SizePreset,
} from "./index.js";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    const sizeList = Object.entries(SIZE_PRESETS)
      .map(([name, size]) => `    ${name.padEnd(10)} ${size.width}x${size.height}`)
      .join("\n");

    console.log(`
Usage: npx @kiliman/screenshot HTML_FILE [OUT_FILE] [OPTIONS]

Arguments:
  HTML_FILE              Path to the HTML file to screenshot (required)
  OUT_FILE              Output filename (optional, default: basename.format)

Options:
  --size PRESET         Use a size preset (see below)
  --width WIDTH         Viewport width in pixels (default: 1280)
  --height HEIGHT       Viewport height in pixels (default: 720)
  --format FORMAT       Image format: png, jpg, jpeg (default: png)
  --outdir DIR          Output directory (default: current directory)
  --help, -h            Show this help message

Size Presets:
${sizeList}

Note: --width and --height override --size preset values

Examples:
  npx @kiliman/screenshot page.html --size github
  npx @kiliman/screenshot page.html --size og --format jpg
  npx @kiliman/screenshot page.html output.png
  npx @kiliman/screenshot page.html --format jpg --width 1920 --height 1080
  npx @kiliman/screenshot page.html screenshot.png --outdir ./screenshots
`);
    process.exit(0);
  }

  const htmlFile = args[0];
  let outputFile: string | undefined;
  const options: ScreenshotOptions = {};

  // Check if second arg is output file or option
  if (args[1] && !args[1].startsWith("--")) {
    outputFile = args[1];
  }

  // Parse options
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--size" && args[i + 1]) {
      const sizePreset = args[i + 1] as SizePreset;
      if (SIZE_PRESETS[sizePreset]) {
        options.size = sizePreset;
      } else {
        const validSizes = Object.keys(SIZE_PRESETS).join(", ");
        console.error(`Invalid size preset: ${sizePreset}. Valid options: ${validSizes}`);
        process.exit(1);
      }
      i++;
    } else if (arg === "--outdir" && args[i + 1]) {
      options.outdir = args[i + 1];
      i++;
    } else if (arg === "--format" && args[i + 1]) {
      const format = args[i + 1].toLowerCase();
      if (format === "png" || format === "jpg" || format === "jpeg") {
        options.format = format;
      } else {
        console.error(`Invalid format: ${format}. Use png, jpg, or jpeg.`);
        process.exit(1);
      }
      i++;
    } else if (arg === "--width" && args[i + 1]) {
      options.width = Number.parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--height" && args[i + 1]) {
      options.height = Number.parseInt(args[i + 1], 10);
      i++;
    }
  }

  try {
    console.log("🎬 Generating screenshot...\n");
    await generateScreenshot(htmlFile, outputFile, options);
    console.log("\n🎉 Screenshot generated successfully!");
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
