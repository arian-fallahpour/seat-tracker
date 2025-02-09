const UoftAdapter = require("../../models/api-adapters/UoftAdapter");
const { processUoftAlert } = require("../../controllers/processorController");

jest.mock("../../models/api-adapters/UoftAdapter");
console.log = jest.fn();

describe("processUoftAlert", () => {
  it("should log a message for sections with reopened seats", async () => {
    const alert = {
      course: {
        code: "CSC108",
        populate: jest.fn().mockImplementation(async ({ path, match }) => {
          alert.course.sections = [
            { type: "LEC", number: "0101", haveSeatsReopened: jest.fn(() => true) }, // Reopened section
            { type: "LEC", number: "0201", haveSeatsReopened: jest.fn(() => false) }, // Not reopened
          ];
        }),
      },
      sections: ["sectionId1", "sectionId2"], // Mock section IDs
    };

    const fetchedCoursesMap = new Map();
    const fetchedCourse = {
      code: "CSC108",
      sections: [
        { type: "LEC", number: "0101", seatsTaken: 100, seatsAvailable: 10 },
        { type: "LEC", number: "0201", seatsTaken: 50, seatsAvailable: 0 },
      ],
    };

    UoftAdapter.getCourses.mockResolvedValueOnce([fetchedCourse]);

    await processUoftAlert(alert, fetchedCoursesMap);

    // Assertions
    expect(alert.course.populate).toHaveBeenCalledWith({
      path: "sections",
      match: { _id: { $in: alert.sections } },
    });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("[ALERT]: Section LEC 0101 in CSC108 is now open!");
  });
});
