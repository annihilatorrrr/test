import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const app = new Application();
const router = new Router();

router.get("/scrape", async (ctx) => {
  const url = ctx.request.url.searchParams.get("url");
  if (!url) {
    ctx.response.status = 400;
    ctx.response.body = { error: 'Missing URL parameter' };
    return;
  }
  console.log(url);
  try {
    const videoSrc = await scrapeVideoSrc(url);
    ctx.response.body = { videoSrc };
  } catch (error) {
    console.error('Scraping error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: error.message || 'Internal Server Error' };
  }
});
app.use(router.routes());
app.use(router.allowedMethods());
async function scrapeVideoSrc(url: string): Promise<string | null> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForTimeout(5000);
  const videoSrc = await page.evaluate(() => {
    const videoElement = document.querySelector('video');
    return videoElement ? videoElement.src : null;
  });
  await browser.close();
  return videoSrc;
}
console.log(`Server running!`);
await app.listen({ port: Number(Deno.env.get("PORT")) });
