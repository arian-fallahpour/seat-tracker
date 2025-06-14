const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

exports.handler = async (event) => {
  const url = event.url; // Expecting { "url": "https://example.com" } in event

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing URL in request." }),
    };
  }

  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // Example: Scrape the page's title and HTML content
    const data = await page.evaluate(() => ({
      title: document.title,
      html: document.documentElement.outerHTML,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
