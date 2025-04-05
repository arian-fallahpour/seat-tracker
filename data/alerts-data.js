const alertsData = {
  alertsPeriodMinutes: 30,
  maxRequestsPerIp: 50,
  enrollmentStartDate: new Date("2025-06-01"),
  enrollmentEndDate: new Date("2025-09-01"),
  allowedToEnrol: undefined,
};

const currentDate = new Date(Date.now());
alertsData.allowedToEnrol =
  process.env.NODE_ENV !== "production" ||
  (currentDate >= alertsData.enrollmentStartDate && currentDate < alertsData.enrollmentEndDate);

module.exports = alertsData;
