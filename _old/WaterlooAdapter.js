const puppeteer = require("puppeteer");

class WaterlooAdapter {
  static URL_HOME = "https://classes.uwaterloo.ca/under.html";

  static sections = { TUT: "tutorial", LAB: "lab" };
  static seasons = { 1: "winter", 5: "summer", 9: "fall" };
  static campuses = {
    UW: "University of Waterloo",
    BLND: "Blended course (University of Waterloo)",
    ONLN: "Online course (University of Waterloo)",
  };

  static async fetchCourses({ term, subject }) {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: false,
      useDataDor: "./tmp",
    });

    // Load home page
    const page = await browser.newPage();
    await page.goto(this.URL_HOME);

    // Go to subject courses page
    await page.select("#term", term);
    await page.select("#ssubject", subject);
    await page.click("form input[type=submit]");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    // Does not work bc function is executed in the browser
    // Extract data from DOM
    return await page.evaluate(this.extractData, { term });
  }

  static extractData({ term }) {
    const courses = [];

    const rows = document.querySelectorAll("body > main > p > table > tbody > tr");
    for (const row of rows) {
      const cells = row.querySelectorAll(":scope > td");

      // If current row holds course data, extract it
      if (cells.length === 4) {
        const course = this.extractCourse({ term, cells });
        courses.push(course);
      }

      // If current row holds section data, extract it
      if (cells.length === 2) {
        const section = this.extractSection({ cells });

        if (section !== null) {
          const course = courses[courses.length - 1];
          course.sections.push(section);
        }
      }
    }

    return courses;
  }

  static extractCourse({ term, cells }) {
    const code = this.extractCourseCode(cells);

    return {
      name: cells[3].textContent.trim(),
      term: this.extractTerm(term),
      code,
      sections: [],
    };
  }

  static extractCourseCode(cells) {
    return `${cells[0].textContent.trim()} ${cells[1].textContent.trim()}`;
  }

  static extractTerm(term) {
    return {
      year: JSON.parse(`20${term.splice(1, 3)}`),
      season: this.seasons[term[term.length - 1]],
    };
  }

  /**
   * May return a null section
   */
  static extractSection({ cells }) {
    const cell = cells[cells.length - 1];
    const rows = cell.querySelectorAll(":scope > table > tbody > tr");

    for (const row of rows) {
      const sectionCells = row.querySelectorAll(":scope > td");

      // If current row holds section data, extract it
      if (sectionCells.length === 12) {
        const [type, number] = sectionCells[1].textContent.trim().split(" ");
        const [university, location] = sectionCells[2].textContent.trim().split(/\s+/);

        if (!this.sections[type]) return null;
        if (!this.campuses[university]) return null;

        return {
          type: this.sections[type],
          number,
          campus: this.campuses[type],
          seatsAvailable: Number(sectionCells[6].textContent.trim()),
          seatsTaken: Number(sectionCells[7].textContent.trim()),
        };
      }
    }
  }

  /**
   * Retrieves all available subjects from the waterloo website
   */
  static async fetchSubjects() {}
}

module.exports = WaterlooAdapter;
