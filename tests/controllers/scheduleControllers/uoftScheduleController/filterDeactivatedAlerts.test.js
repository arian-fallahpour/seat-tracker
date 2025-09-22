const uoftScheduleController = require("../../../../controllers/scheduleControllers/uoftScheduleController");

test("should filter out, and deactivate outdated alerts", async () => {
  const alerts = [
    {
      id: 1,
      status: "active",
      course: { isEnrollable: jest.fn(() => true) },
      deactivate: jest.fn(),
    },
    {
      id: 2,
      status: "active",
      course: { isEnrollable: jest.fn(() => false) },
      deactivate: jest.fn(),
    },
    {
      id: 3,
      status: "active",
      course: { isEnrollable: jest.fn(() => false) },
      deactivate: jest.fn(),
    },
    {
      id: 4,
      status: "active",
      course: { isEnrollable: jest.fn(() => true) },
      deactivate: jest.fn(),
    },
  ];

  const activeAlerts = await uoftScheduleController.filterDeactivatedAlerts(alerts);

  expect(alerts[0].deactivate).not.toHaveBeenCalled();
  expect(alerts[1].deactivate).toHaveBeenCalled();
  expect(alerts[2].deactivate).toHaveBeenCalled();
  expect(alerts[3].deactivate).not.toHaveBeenCalled();

  expect(activeAlerts).toHaveLength(2);
  expect(activeAlerts[0].id).toBe(alerts[0].id);
  expect(activeAlerts[1].id).toBe(alerts[3].id);
});
