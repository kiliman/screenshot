#!/usr/bin/env node

import { generateScreenshot, type ScreenshotOptions } from "./index.js";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: npx @kiliman/screenshot HTML_FILE [OUT_FILE] [OPTIONS]

Arguments:
  HTML_FILE              Path to the HTML file to screenshot (required)
  OUT_FILE              Output filename (optional, default: basename.format)

Options:
  --outdir DIR          Output directory (default: current directory)
  --format FORMAT       Image format: png, jpg, jpeg (default: png)
  --width WIDTH         Viewport width in pixels (default: 1280)
  --height HEIGHT       Viewport height in pixels (default: 720)
  --help, -h            Show this help message

Examples:
  npx @kiliman/screenshot page.html
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

    if (arg === "--outdir" && args[i + 1]) {
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
