const enums = {
  alert: {
    status: ["processing", "active", "paused", "inactive"],
  },
  section: {
    type: ["tutorial", "lab"],
    deliveryMode: ["in person", "hybrid", "online"],
    // campus: {
    //   UoftSection: ["Scarborough", "Mississauga", "St. George"],
    //   WaterlooSection: ["University of Waterloo", "Online"],
    // },
  },
  term: { season: ["fall", "winter", "summer"] },
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
