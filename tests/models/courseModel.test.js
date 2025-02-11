const Course = require("../../models/database/Course/Course"); // Adjust the import as necessary
const UoftAdapter = require("../../models/api-adapters/UoftAdapter"); // Adjust the import as necessary

const getUpdatedCourse = Course.schema.statics.getUpdatedCourse;

jest.mock("../../models/api-adapters/UoftAdapter"); // Mock the adapter to avoid real API calls

describe("getUpdatedCourse", () => {
  const courseCode = "CSC108";
  let courseInstance;
  let courseCache;

  beforeEach(() => {
    courseCache = new Map();
    courseInstance = { code: courseCode, getUpdatedCourse };
  });

  it("should return cached course if it already exists", async () => {
    const cachedCourse = { code: courseCode, name: "Introduction to Computer Science" };
    courseCache.set(courseCode, cachedCourse);

    const result = await courseInstance.getUpdatedCourse(courseCache);

    expect(result).toBe(cachedCourse);
  });

  it("should cache every fetched course", async () => {
    const fetchedCourses = [
      { code: "CSC108", name: "Introduction to Computer Science" },
      { code: "CSC148", name: "Introduction to Computer Programming" },
    ];
    UoftAdapter.getCourses.mockResolvedValue(fetchedCourses);

    const result = await courseInstance.getUpdatedCourse(courseCache);

    expect(result).toEqual(fetchedCourses[0]);
    expect(courseCache.has("CSC108")).toBe(true);
    expect(courseCache.get("CSC108")).toEqual(fetchedCourses[0]);
    expect(courseCache.has("CSC148")).toBe(true);
    expect(courseCache.get("CSC148")).toEqual(fetchedCourses[1]);
  });

  it("should return null if it hasn't found the updated course", async () => {
    const fetchedCourses = [
      { code: "CSC148", name: "Introduction to Computer Programming" },
      { code: "CSC165", name: "Mathematical Expression and Reasoning for CS" },
    ];
    UoftAdapter.getCourses.mockResolvedValue(fetchedCourses);

    const result = await courseInstance.getUpdatedCourse(courseCache);

    expect(result).toBeNull();
  });
});
