const mongoose = require("mongoose");
const { validateSeatsTaken, calculateEmptySeats } = require("../../../utils/schema-utils");
const Section = require("./Section");

const waterlooSectionSchema = new mongoose.Schema(
  {
    seatsTaken: {
      type: Number,
      required: [true, "Seats taken is required."],
      default: 0,
      min: [0, "Seats taken cannot be a negative number."],
      validate: {
        validator: validateSeatsTaken,
        message: "Seats taken must be less than or equal to seats available.",
      },
    },
    seatsAvailable: {
      type: Number,
      min: [0, "Seats available cannot be a negative number."],
      required: [true, "Seats available is required."],
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

waterlooSectionSchema.virtual("seatsEmpty").get(calculateEmptySeats);

/**
 * METHODS
 */

const WaterlooSection = Section.discriminator("WaterlooSection", waterlooSectionSchema);

module.exports = WaterlooSection;
