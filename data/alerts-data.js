const alertsData = {
  alertPriceCAD: 0,
  alertsPeriodMinutes: 15,
  daysPerFreeAlert: 1,
  alertVerificationTimeLimitMinutes: 10,
  maxRequestsPerLambdaIp: 50,
  maxSectionsPerAlert: 10,
  enrollmentDates: {
    fall: [new Date("2024-07-07"), new Date("2024-09-15")], // 2024
    winter: [new Date("2024-07-07"), new Date("2025-01-19")], // 2025
    "fall-winter": [new Date("2024-07-07"), new Date("2024-09-15")], // 2024
    "summer-first": [new Date("2025-03-03"), new Date("2025-05-12")], // 2025
    // "summer-first": [new Date("2025-03-03"), new Date("2025-05-11")], // 2025
    "summer-second": [new Date("2025-03-03"), new Date("2025-06-08")], // 2025
    "summer-full": [new Date("2025-03-03"), new Date("2025-05-11")], // 2025
  },
};

module.exports = alertsData;
