const AlertModel = require("../../../models/AlertModel");

test("should return empty object", () => {
  const alerts = [];
  const alertsGroupedByCourseCodes = AlertModel.groupByCode(alerts);

  expect(alertsGroupedByCourseCodes).toEqual({});
});

test("should group common courses", () => {
  const alerts = [
    { email: "email1@gmail.com", course: { code: "abc" } },
    { email: "email2@gmail.com", course: { code: "abc" } },
    { email: "email1@gmail.com", course: { code: "def" } },
    { email: "email2@gmail.com", course: { code: "def" } },
    { email: "email4@gmail.com", course: { code: "def" } },
    { email: "email5@gmail.com", course: { code: "hij" } },
  ];

  const alertsGroupedByCourseCodes = AlertModel.groupByCode(alerts);

  expect(alertsGroupedByCourseCodes["abc"]).toEqual([
    { email: "email1@gmail.com", course: { code: "abc" } },
    { email: "email2@gmail.com", course: { code: "abc" } },
  ]);
  expect(alertsGroupedByCourseCodes["def"]).toEqual([
    { email: "email1@gmail.com", course: { code: "def" } },
    { email: "email2@gmail.com", course: { code: "def" } },
    { email: "email4@gmail.com", course: { code: "def" } },
  ]);
  expect(alertsGroupedByCourseCodes["hij"]).toEqual([
    { email: "email5@gmail.com", course: { code: "hij" } },
  ]);
});

test("should handle no code", () => {
  const alerts = [
    { email: "email1@gmail.com", course: { code: "abc" } },
    { email: "email2@gmail.com", course: {} },
  ];

  const alertsGroupedByCourseCodes = AlertModel.groupByCode(alerts);
  expect(alertsGroupedByCourseCodes).toEqual({
    abc: [{ email: "email1@gmail.com", course: { code: "abc" } }],
  });
});
