const { chromium } = require("playwright");
const path = require("path");

const imagePath =
  process.argv[2] || path.join(__dirname, "..", "assets", "reference-composite.png");
const outputPath = process.argv[3] || "/private/tmp/xhs-uploaded.png";
const baseUrl = process.env.POSTER_BASE_URL || "http://127.0.0.1:4174/";
const browserPath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;

(async () => {
  const browser = await chromium.launch(browserPath ? { headless: true, executablePath: browserPath } : { headless: true });

  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.setInputFiles("#avatarFile", imagePath);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();
})();
