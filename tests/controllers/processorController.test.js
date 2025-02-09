const UoftAdapter = require("../../models/api-adapters/UoftAdapter");
const { processUoftAlert } = require("../../controllers/processorController");

jest.mock("../../models/api-adapters/UoftAdapter");

describe("processUoftAlert", () => {
  it("should send a notification for sections with reopened seats", async () => {
    const sendNotification = jest.fn();

    const alert = {
      course: {
        code: "CSC108",
        populate: jest.fn().mockImplementation(async ({ path, match }) => {
          alert.course.sections = [
            {
              type: "tutorial",
              number: "0101",
              seatsTaken: 100,
              seatsAvailable: 100,
              haveSeatsReopened: jest.fn(() => true),
            },
            {
              type: "tutorial",
              number: "0201",
              seatsTaken: 50,
              seatsAvailable: 100,
              haveSeatsReopened: jest.fn(() => false),
            },
          ];
        }),
      },
      sections: ["sectionId1", "sectionId2"], // Mock section IDs
    };
    const updatedCoursesMap = new Map();

    const updatedCourse = {
      code: "CSC108",
      sections: [
        { type: "tutorial", number: "0101", seatsTaken: 99, seatsAvailable: 100 },
        { type: "tutorial", number: "0201", seatsTaken: 50, seatsAvailable: 100 },
      ],
    };

    UoftAdapter.getCourses.mockResolvedValueOnce([updatedCourse]);

    await processUoftAlert(alert, updatedCoursesMap);

    // Assertions
    expect(sendNotification).toHaveBeenCalledTimes(1);
  });
});
