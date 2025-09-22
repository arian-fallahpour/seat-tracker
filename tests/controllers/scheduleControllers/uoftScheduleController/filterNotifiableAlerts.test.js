const uoftScheduleController = require("../../../../controllers/scheduleControllers/uoftScheduleController");

test("Should return empty array alerts don't have course or its course code is null", async () => {
  const alerts = [
    { id: 1, course: undefined, getOpenedSections: jest.fn(() => [{ id: "A" }]) },
    { id: 2, course: { code: undefined }, getOpenedSections: jest.fn(() => [{ id: "B" }]) },
  ];

  const updatedCoursesByCode = {
    1: { code: "1" },
  };

  const notifiableAlerts = await uoftScheduleController.filterNotifiableAlerts(
    alerts,
    updatedCoursesByCode
  );

  expect(notifiableAlerts).toHaveLength(0);
});

test("Should filter alerts that have changed state to opened", async () => {
  const openedSections = [{ id: "A" }, { id: "B" }];
  const alerts = [
    {
      id: 1,
      course: { code: "1" },
      getOpenedSections: jest.fn(() => []),
    },
    {
      id: 2,
      course: { code: "2" },
      getOpenedSections: jest.fn(() => openedSections),
    },
    {
      id: 3,
      course: undefined,
      getOpenedSections: jest.fn(() => openedSections),
    },
  ];

  const updatedCoursesByCode = { 1: { code: "1" }, 2: { code: "2" } };

  const notifiableAlerts = await uoftScheduleController.filterNotifiableAlerts(
    alerts,
    updatedCoursesByCode
  );

  expect(notifiableAlerts).toHaveLength(1);
  expect(notifiableAlerts[0].id).toBe(alerts[1].id);
  expect(notifiableAlerts[0].openedSections).toBe(openedSections);
});
