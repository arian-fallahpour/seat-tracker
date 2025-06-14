const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const selectors = {
  jobList: ".ms-List-page",
  jobItem: ".ms-List-page > .ms-List-cell",
  jobDetailsButton: ".ms-List-page > .ms-List-cell .ms-Link",
  jobListButton: ".SearchAppWrapper > .ms-Stack > .ms-Button",

  jobDetails: ".SearchJobDetailsCard",
  jobTitle: ".SearchJobDetailsCard > h1",
  jobLocation: ".SearchJobDetailsCard > .ms-Stack:nth-child(3) > .ms-Stack-inner > p",
  jobNumber:
    ".SearchJobDetailsCard > :nth-child(5) > :nth-child(2) > .ms-Stack > .ms-Stack:nth-child(2)",
  jobProfession:
    ".SearchJobDetailsCard > :nth-child(5) > :nth-child(6) > .ms-Stack > .ms-Stack:nth-child(2)",
  jobType:
    ".SearchJobDetailsCard > :nth-child(5) > :nth-child(8) > .ms-Stack > .ms-Stack:nth-child(2)",
};

(async () => {
  const url =
    "https://jobs.careers.microsoft.com/global/en/search?q=software%20engineer&lc=United%20States&exp=Students%20and%20graduates&l=en_us&pg=1&pgSz=20&o=Relevance&flt=true";

  let browser = null;
  try {
    const t1 = performance.now();

    browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();
    await page.goto(url);

    await page.waitForSelector(selectors.jobList);

    let jobs = [];
    let buttons = await page.$$(selectors.jobDetailsButton);
    for (let i = 0; i < buttons.length; i++) {
      console.log(`Visting job ${jobs.length + 1}`);

      await buttons[i].click();
      await page.waitForSelector(selectors.jobDetails);

      const data = await page.evaluate(getJobData, selectors);
      jobs.push(data);

      const back = await page.$(selectors.jobListButton);
      await back.click();
      await page.waitForSelector(selectors.jobList);

      buttons = await page.$$(selectors.jobDetailsButton);
    }

    const t2 = performance.now();
    console.log(`Found ${jobs.length} job listings (${t2 - t1}ms):`);
    console.log(jobs);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  if (browser !== null) {
    await browser.close();
  }

  process.exit();
})();

function getJobData(selectors) {
  const titleEl = document.querySelector(selectors.jobTitle);
  const locationEl = document.querySelector(selectors.jobLocation);
  const numberEl = document.querySelector(selectors.jobNumber);
  const professionEl = document.querySelector(selectors.jobProfession);
  const typeEl = document.querySelector(selectors.jobType);

  return {
    title: titleEl ? titleEl.textContent.trim() : null,
    location: locationEl ? locationEl.textContent.trim() : null,
    number: numberEl ? numberEl.textContent.trim() : null,
    profession: professionEl ? professionEl.textContent.trim() : null,
    type: typeEl ? typeEl.textContent.trim() : null,
  };
}
