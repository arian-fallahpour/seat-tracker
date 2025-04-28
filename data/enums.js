const enums = {
  alert: {
    status: ["processing", "active", "inactive"],
  },
  course: {
    campus: {
      UoftSection: ["Scarborough", "Mississauga", "St. George"],
    },
  },
  section: {
    type: ["lecture", "tutorial", "lab", "practical", "other"],
    deliveryMode: ["in person", "hybrid", "online"],
  },
  term: {
    season: ["fall", "winter", "fall-winter", "summer-first", "summer-second", "summer-full"],
  },
  log: {
    type: [
      "info", // General operational messages, no log created
      "log", // General operational messages, log created
      "warn", // A potential issue that doesn’t cause failure but may need attention, log created
      "error", // A severe issue that affects the system’s operation, log created
      "alert", // A critical issue that results in a notification being sent, log created
    ],
  },
};
module.exports = enums;
