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
    type: ["tutorial", "lab"],
    deliveryMode: ["in person", "hybrid", "online"],
  },
  term: {
    season: ["fall", "winter", "fall-winter", "summer-first", "summer-second", "summer-full"],
  },
  log: {
    type: [
      "info", // General operational messages, no issue
      "warning", // A potential issue that doesn’t cause failure but may need attention
      "error", // A severe issue that affects the system’s operation
      "alert", // A critical issue that results in a notification being sent
    ],
  },
};
module.exports = enums;
