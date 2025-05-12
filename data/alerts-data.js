const { DateTime } = require("luxon");

const alertsData = {
  alertPriceCAD: 2,
  alertsPeriodMinutes: 15,
  daysPerFreeAlert: 1,
  alertVerificationTimeLimitMinutes: 10,
  maxRequestsPerLambdaIp: 50,
  maxSectionsPerAlert: 10,
  enrollmentDates: {
    fall: [easternToUTC("2024-07-07"), easternToUTC("2024-09-15")], // 2024
    winter: [easternToUTC("2024-07-07"), easternToUTC("2025-01-19")], // 2025
    "fall-winter": [easternToUTC("2024-07-07"), easternToUTC("2024-09-15")], // 2024
    "summer-first": [easternToUTC("2025-03-03"), easternToUTC("2025-05-12")], // 2025
    // "summer-first": [easternToUTC("2025-03-03"), easternToUTC("2025-05-11")], // 2025
    "summer-second": [easternToUTC("2025-03-03"), easternToUTC("2025-06-08")], // 2025
    "summer-full": [easternToUTC("2025-03-03"), easternToUTC("2025-05-11")], // 2025
  },
};

function easternToUTC(date) {
  return DateTime.fromISO(date, { zone: "America/Toronto" }).toUTC().toJSDate();
}

module.exports = alertsData;
