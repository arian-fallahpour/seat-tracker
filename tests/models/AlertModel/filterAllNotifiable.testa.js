const AlertModel = require("../../../models/AlertModel");

test("should handle empty inputs", async () => {
  const alerts = [];
  const updatedCoursesByCode = {};

  const filteredAlerts = await AlertModel.filterAllNotifiable(alerts, updatedCoursesByCode);

  expect(filteredAlerts).toEqual([]);
});

test("should handle no course found in updated courses", async () => {
  const alerts = [
    { email: "test1@gmail.com", course: { code: "abc" } },
    { email: "test2@gmail.com", course: { code: "def" } },
  ];
  const updatedCoursesByCode = {};

  const filteredAlerts = await AlertModel.filterAllNotifiable(alerts, updatedCoursesByCode);

  expect(filteredAlerts).toEqual([]);
});

test("should match between updated courses and alert course, but no freed sections", async () => {
  const alerts = [
    {
      email: "test1@gmail.com",
      course: { code: "abc" },
      getFreedSections: jest.fn().mockResolvedValue([]),
    },
  ];
  const updatedCoursesByCode = {
    abc: { sections: [{ seatsTaken: 50, seatsAvailable: 55 }] },
  };

  const filteredAlerts = await AlertModel.filterAllNotifiable(alerts, updatedCoursesByCode);
  expect(filteredAlerts).toEqual([]);
});

test("should match between updated courses and alert course with freed sections", async () => {
  const freedSections = [{ seatsTaken: 50, seatsAvailable: 55 }];
  const alert = {
    email: "test1@gmail.com",
    course: { code: "abc" },
    getFreedSections: jest.fn().mockResolvedValue(freedSections),
  };

  const updatedCoursesByCode = {
    abc: { code: "abc" },
  };

  const filteredAlerts = await AlertModel.filterAllNotifiable([alert], updatedCoursesByCode);
  expect(filteredAlerts).toMatchObject([
    {
      email: "test1@gmail.com",
      course: { code: "abc" },
      freedSections,
    },
  ]);
});

test("should match between multiple updated courses and alert course with freed sections", async () => {
  const freedAlertSections = [
    [
      { seatsTaken: 50, seatsAvailable: 55 },
      { seatsTaken: 50, seatsAvailable: 55 },
    ],
    [{ seatsTaken: 50, seatsAvailable: 55 }],
    [],
  ];
  const alerts = [
    {
      email: "test1@gmail.com",
      course: { code: "abc" },
      getFreedSections: jest.fn().mockResolvedValue(freedAlertSections[0]),
    },
    {
      email: "test2@gmail.com",
      course: { code: "def" },
      getFreedSections: jest.fn().mockResolvedValue(freedAlertSections[1]),
    },
    {
      email: "test3@gmail.com",
      course: { code: "abc" },
      getFreedSections: jest.fn().mockResolvedValue(freedAlertSections[2]),
    },
  ];

  const updatedCoursesByCode = {
    abc: { code: "abc" },
    def: { code: "def" },
  };

  const expectedFilteredAlert1 = { ...alerts[0], freedSections: freedAlertSections[0] };
  const expectedFilteredAlert2 = { ...alerts[1], freedSections: freedAlertSections[1] };

  const filteredAlerts = await AlertModel.filterAllNotifiable(alerts, updatedCoursesByCode);

  expect(filteredAlerts).toHaveLength(2);
  expect(filteredAlerts[0]).toMatchObject(expectedFilteredAlert1);
  expect(filteredAlerts[1]).toMatchObject(expectedFilteredAlert2);
});

test("should continue if one alert (in the middle of array) throws error", async () => {
  const freedAlertSections = [
    [
      { seatsTaken: 50, seatsAvailable: 55 },
      { seatsTaken: 50, seatsAvailable: 55 },
    ],
    [{ seatsTaken: 50, seatsAvailable: 55 }],
    [
      { seatsTaken: 50, seatsAvailable: 55 },
      { seatsTaken: 50, seatsAvailable: 55 },
      { seatsTaken: 50, seatsAvailable: 55 },
    ],
  ];
  const alerts = [
    {
      email: "test1@gmail.com",
      course: { code: "abc" },
      getFreedSections: jest.fn().mockResolvedValue(freedAlertSections[0]),
    },
    {
      email: "test2@gmail.com",
      course: { code: "def" },
      getFreedSections: jest.fn().mockRejectedValue(new Error("Mocked failure")),
    },
    {
      email: "test3@gmail.com",
      course: { code: "def" },
      getFreedSections: jest.fn().mockResolvedValue(freedAlertSections[2]),
    },
  ];

  const updatedCoursesByCode = {
    abc: { code: "abc" },
    def: { code: "def" },
  };

  const expectedFilteredAlert1 = { ...alerts[0], freedSections: freedAlertSections[0] };
  const expectedFilteredAlert3 = { ...alerts[2], freedSections: freedAlertSections[2] };

  const filteredAlerts = await AlertModel.filterAllNotifiable(alerts, updatedCoursesByCode);

  expect(filteredAlerts).toHaveLength(2);
  expect(filteredAlerts[0]).toMatchObject(expectedFilteredAlert1);
  expect(filteredAlerts[1]).toMatchObject(expectedFilteredAlert3);
});
