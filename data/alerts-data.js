const { DateTime } = require("luxon");

const alertsData = {
  alertPriceCAD: 0,
  alertVerificationTimeLimitMinutes: 10,
  alertCreationCooldownDays: 1,
  alertCreationCooldownCount: 3,
  alertsPeriodMinutes: 5,

  maxRequestsPerLambda: 20,
  maxConcurrentLambdas: 20, // NOTE, if increasing, make sure you run the create lambdas script first
  maxSectionsPerAlert: 10,

  enrollmentDates: {
    fall: [easternToUTC("2025-07-01"), easternToUTC("2025-09-15")], // 2025
    winter: [easternToUTC("2025-07-01"), easternToUTC("2026-01-18")], // 2026
    "fall-winter": [easternToUTC("2025-07-01"), easternToUTC("2025-09-15")], // 2025
    "summer-first": [easternToUTC("2025-03-03"), easternToUTC("2025-05-11")], // 2025
    "summer-second": [easternToUTC("2025-03-03"), easternToUTC("2025-06-08")], // 2025
    "summer-full": [easternToUTC("2025-03-03"), easternToUTC("2025-05-11")], // 2025
  },
};

function easternToUTC(date) {
  return DateTime.fromISO(date, { zone: "America/Toronto" }).toUTC().toJSDate();
}

module.exports = alertsData;
