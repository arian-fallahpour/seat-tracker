const mongoose = require("mongoose");
const enums = require("../../data/enums");

const termSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: [true, "Please provide a year for the course term."],
    min: [2000, "Course term year must be greater than 2000"],
  },
  season: {
    type: String,
    required: [true, "Please provide the season for the course term."],
    enum: {
      values: enums.term.season,
      message: "Please provide a valid season for the course term.",
    },
  },
});

/**
 * July 1, YEAR A - Sept 15, YEAR A (WINTER, FALL)
 * Marc 3, YEAR A - July 8, YEAR A (SUMMER)
 */
termSchema.statics.canEnroll = function (term) {};

const TermModel = mongoose.models?.Term || mongoose.model("Term", termSchema);
module.exports = TermModel;
