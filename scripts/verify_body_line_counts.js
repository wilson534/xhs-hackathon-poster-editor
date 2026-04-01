const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const outputDir = process.argv[2] || "/private/tmp/xhs-body-line-counts";
const baseUrl = process.env.POSTER_BASE_URL || "http://127.0.0.1:4174/";
const browserPath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch(browserPath ? { headless: true, executablePath: browserPath } : { headless: true });

  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator('[data-body-line-count="1"]').click();
  await page.locator('[data-body-line-input="0"]').fill(
    "上次去黑客松我妈报警了我妈说再去这种黑客搞的活动把我腿打断这次我还是先不来了吧但如果队友靠谱我也不是不能再考虑一下",
  );

  for (const lineCount of [1, 2, 3, 4]) {
    await page.locator(`[data-body-line-count="${lineCount}"]`).click();
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(outputDir, `body-lines-${lineCount}.png`),
      fullPage: true,
    });
  }

  await browser.close();
}

main().catch((error) => {
  console.error("校验正文行数失败", error);
  process.exit(1);
});
