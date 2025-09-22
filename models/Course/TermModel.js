const mongoose = require("mongoose");
const enums = require("../../data/enums");
const alertsData = require("../../data/alerts-data");

const termSchema = new mongoose.Schema(
  {
    season: {
      type: String,
      required: [true, "Please provide the season for the course term."],
      enum: {
        values: enums.term.season,
        message: "Please provide a valid season for the course term.",
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * VIRTUALS
 */

termSchema.virtual("year").get(function () {
  return alertsData.enrollmentDates[this.season][1].getFullYear();
});

termSchema.virtual("name").get(function () {
  return formatSeason(this.season);
});

/**
 * STATICS
 */

termSchema.statics.formatSeason = formatSeason;
function formatSeason(season) {
  if (season === "fall-winter") return "fall/winter";
  if (season.startsWith("summer")) {
    const split = season.split("-");
    return `${split[0]} (${split[1]})`;
  }
  return season;
}

termSchema.statics.getEnrollableSeasons = function () {
  const { enrollmentDates } = alertsData;
  const currentDate = new Date(Date.now());

  const seasons = Object.keys(enrollmentDates);
  const enrollableTerms = seasons.filter((term) => {
    return (
      enrollmentDates[term][0] < currentDate && // Enrollable at start of day
      currentDate < new Date(enrollmentDates[term][1].getTime() + 24 * 60 * 60 * 1000) // Still enrollable until the end of the day
    );
  });

  return enrollableTerms;
};

const TermModel = mongoose.models?.Term || mongoose.model("Term", termSchema);
module.exports = TermModel;
