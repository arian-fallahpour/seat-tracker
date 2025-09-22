const uoftScheduleController = require("../../../../controllers/scheduleControllers/uoftScheduleController");

test("should return one course with two sections that changed state ", () => {
  const oldCoursesByCode = {
    1: {
      code: "1",
      sections: [
        {
          id: "1",
          type: "lec",
          number: "1",
          hasOpened: jest.fn(() => false),
          hasFilled: jest.fn(() => false),
        },
        {
          id: "2",
          type: "lec",
          number: "2",
          hasOpened: jest.fn(() => true),
          hasFilled: jest.fn(() => false),
        },
        {
          id: "3",
          type: "lec",
          number: "3",
          hasOpened: jest.fn(() => false),
          hasFilled: jest.fn(() => true),
        },
        {
          id: "4",
          type: "lec",
          number: "4",
          hasOpened: jest.fn(() => false),
          hasFilled: jest.fn(() => true),
        },
      ],
    },
  };

  const updatedCoursesByCode = {
    1: {
      code: "1",
      sections: [
        { id: "1", type: "lec", number: "1" },
        { id: "2", type: "lec", number: "2" },
        { id: "4", type: "lec", number: "4" },
      ],
    },
  };
  const upsertableCourses = uoftScheduleController.filterCoursesByStateChange(
    oldCoursesByCode,
    updatedCoursesByCode
  );
  expect(upsertableCourses).toHaveLength(1);
  expect(upsertableCourses[0].sections).toHaveLength(2);
  expect(upsertableCourses[0].sections[0].id).toBe("2");
  expect(upsertableCourses[0].sections[1].id).toBe("4");
});
