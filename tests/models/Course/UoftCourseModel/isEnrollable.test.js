const TermModel = require("../../../../models/Course/TermModel");
const UoftCourseModel = require("../../../../models/Course/UoftCourseModel");

jest.spyOn(TermModel, "getEnrollableSeasons");

test("should return true if current term is enrollable", () => {
  TermModel.getEnrollableSeasons.mockReturnValue(["season-1", "season-2"]);

  const mockCourse = {
    term: {
      season: "season-2",
      year: 2099,
    },
  };
  const isEnrollable = UoftCourseModel.schema.methods.isEnrollable.call(mockCourse);

  expect(isEnrollable).toBe(true);
});

test("should return false if current term is not enrollable", () => {
  TermModel.getEnrollableSeasons.mockReturnValue(["season-1", "season-3"]);

  const mockCourse = {
    term: {
      season: "season-2",
      year: 2099,
    },
  };
  const isEnrollable = UoftCourseModel.schema.methods.isEnrollable.call(mockCourse);

  expect(isEnrollable).toBe(false);
});
