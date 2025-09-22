const uoftScheduleController = require("../../../../controllers/scheduleControllers/uoftScheduleController");

test("should group alerts by their course code", () => {
  const alerts = [
    {
      id: 1,
      course: { code: "CSC108H1" },
    },
    {
      id: 2,
      course: { code: "CSC148H1" },
    },
    {
      id: 3,
      course: { code: "CSC108H1" },
    },
    {
      id: 4,
      course: { code: "MAT137Y1" },
    },
    {
      id: 5,
      course: { code: "CSC148H1" },
    },
    {
      id: 6,
      course: undefined,
    },
    {
      id: 7,
      course: { code: null },
    },
  ];

  const groupedAlertsByCode = uoftScheduleController.groupAlertsByCourseCode(alerts);

  expect(Object.keys(groupedAlertsByCode)).toHaveLength(3);

  expect(groupedAlertsByCode["CSC108H1"]).toBeInstanceOf(Array);
  expect(groupedAlertsByCode["CSC148H1"]).toBeInstanceOf(Array);
  expect(groupedAlertsByCode["MAT137Y1"]).toBeInstanceOf(Array);
  expect(groupedAlertsByCode["CSC108H1"]).toHaveLength(2);
  expect(groupedAlertsByCode["CSC148H1"]).toHaveLength(2);
  expect(groupedAlertsByCode["MAT137Y1"]).toHaveLength(1);

  expect(groupedAlertsByCode["CSC108H1"][0].id).toBe(alerts[0].id);
  expect(groupedAlertsByCode["CSC108H1"][1].id).toBe(alerts[2].id);
  expect(groupedAlertsByCode["CSC148H1"][0].id).toBe(alerts[1].id);
  expect(groupedAlertsByCode["CSC148H1"][1].id).toBe(alerts[4].id);
  expect(groupedAlertsByCode["MAT137Y1"][0].id).toBe(alerts[3].id);
});
