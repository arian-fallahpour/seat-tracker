import UoftAdapter from "@/utils/Uoft/UoftAdapter";
import { DateTime } from "luxon";

const fallYear = UoftAdapter.getSchoolYear();

const alertsData = {
  alertPriceCAD: 0,

  alertCreationCooldownDays: 1,
  alertCreationCooldownCount: 3,
  periodMinutes: 5,
  maxSectionsPerAlert: 10,

  maxLambdaRequests: 20,
  maxLambdas: 20, // NOTE, if increasing, make sure you run the create lambdas script first

  uoft: {
    enrollmentDates: {
      fall: [easternToUTC(`${fallYear}-07-01`), easternToUTC(`${fallYear}-09-15`)],
      winter: [easternToUTC(`${fallYear}-07-01`), easternToUTC(`${fallYear + 1}-01-18`)],
      "fall-winter": [easternToUTC(`${fallYear}-07-01`), easternToUTC(`${fallYear}-09-15`)],
      "summer-first": [
        easternToUTC(`${fallYear + 1}-03-02`),
        easternToUTC(`${fallYear + 1}-05-10`),
      ],
      "summer-second": [
        easternToUTC(`${fallYear + 1}-03-02`),
        easternToUTC(`${fallYear + 1}-07-08`),
      ],
      "summer-full": [easternToUTC(`${fallYear + 1}-03-02`), easternToUTC(`${fallYear + 1}-05-10`)],
    },
  },
};

function easternToUTC(date: string): Date {
  return DateTime.fromISO(date, { zone: "America/Toronto" }).toUTC().toJSDate();
}

export default alertsData;

// Sep 2025 - Dec 2025 (current year is )

// Jan 2026 - Sep 2026
