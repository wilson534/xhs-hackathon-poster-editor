const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const outputPath =
  process.argv[2] || path.join(__dirname, "..", ".github", "assets", "readme-cover.png");
const baseUrl = process.env.POSTER_BASE_URL || "https://xhs-hackathon-poster.vercel.app";
const browserPath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;

async function main() {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const browser = await chromium.launch(browserPath ? { headless: true, executablePath: browserPath } : { headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200, deviceScaleFactor: 1 } });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator(".app-shell").screenshot({ path: outputPath });
  await browser.close();
  console.log(`README 封面图已生成：${outputPath}`);
}

main().catch((error) => {
  console.error("生成 README 封面图失败", error);
  process.exit(1);
});
