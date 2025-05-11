const mongoose = require("mongoose");
const enums = require("../../data/enums");
const { getEnrollableSeasons } = require("../../utils/app/schema-utils");
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

termSchema.statics.getEnrollableSeasons = getEnrollableSeasons;

const TermModel = mongoose.models?.Term || mongoose.model("Term", termSchema);
module.exports = TermModel;
