import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import WaterlooAdapter from "./WaterlooAdapter.js";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: false,
    useDataDor: "./tmp",
  });

  const term = "1259";
  const subject = "AMATH";

  //   const page = await browser.newPage();
  //   await page.goto("https://classes.uwaterloo.ca/under.html");

  //   // Go to subject courses page
  //   await page.select("#term", term);
  //   await page.select("#ssubject", subject);
  //   await page.click("form input[type=submit]");
  //   await page.waitForNavigation({ waitUntil: "networkidle2" });

  //   const courses = await page.evaluate(() => {
  //     const courses = [];

  //     const rowsSelector = "body > main > p > table > tbody > tr";
  //     const tableRows = document.querySelectorAll(rowsSelector);

  //     for (const tableRow of tableRows) {
  //       const tableCells = tableRow.querySelectorAll(":scope > td");

  //       const isRowCourseData = tableCells.length === 4;
  //       if (isRowCourseData) {
  //         courses.push({
  //           subject: tableCells[0].textContent.trim(),
  //           number: Number(tableCells[1].textContent),
  //           name: tableCells[3].textContent.trim(),
  //           sections: [],
  //         });
  //       }

  //       const doesRowContainSectionData = tableCells.length === 2;
  //       if (doesRowContainSectionData) {
  //         const sectionDataCell = tableCells[tableCells.length - 1];
  //         const sectionRows = sectionDataCell.querySelectorAll(":scope > table > tbody > tr");

  //         for (const sectionRow of sectionRows) {
  //           const sectionCells = sectionRow.querySelectorAll(":scope > td");

  //           const isRowSectionData = sectionCells.length === 12;
  //           if (isRowSectionData) {
  //             const sectionIdentifier = sectionCells[1].textContent.trim().split(" ");

  //             courses[courses.length - 1].sections.push({
  //               type: sectionIdentifier[0],
  //               number: sectionIdentifier[1],
  //               campus: sectionCells[2].textContent.split(/\s+/).join(" ").trim(),
  //               seatsAvailable: Number(sectionCells[6].textContent.trim()),
  //               seatsTaken: Number(sectionCells[7].textContent.trim()),
  //             });
  //           }
  //         }
  //       }
  //     }

  //     return courses;
  //   });

  const courses = await WaterlooAdapter.fetchCourses({ term, subject });

  console.dir(courses, { depth: null });
  fs.writeFileSync(
    path.join(__dirname + "/outputs/waterloo-courses.json"),
    JSON.stringify(courses, null, 2),
    "utf8"
  );

  await browser.close();
})();
