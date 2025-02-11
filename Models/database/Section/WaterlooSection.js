const mongoose = require("mongoose");
const {
  validateSeatsTaken,
  calculateEmptySeats,
  haveSeatsFreed,
} = require("../../../utils/schema-utils");
const Section = require("./Section");

const waterlooSectionSchema = new mongoose.Schema(
  {
    seatsTaken: {
      type: Number,
      required: [true, "Seats taken is required."],
      default: 0,
      min: [0, "Seats taken cannot be a negative number."],
      validator: {
        validate: validateSeatsTaken,
        message: "Seats taken must be less than or equal to seats available.",
      },
    },
    seatsAvailable: {
      type: Number,
      min: [0, "Seats available cannot be a negative number."],
      required: [true, "Seats available is required."],
      default: 0,
    },
    waitlistCapacity: {
      type: Number,
      required: [true, "Waitlist count is required."],
      default: 0,
      min: [0, "Waitlist count cannot be a negative number."],
    },
    waitlist: {
      type: Number,
      required: [true, "Waitlist count is required."],
      default: 0,
      min: [0, "Waitlist count cannot be a negative number."],
      validator: {
        validate: function (waitlist) {
          return waitlist <= this.waitlistCapacity;
        },
        message: "Waitlist must be less than waitlist capacity.",
      },
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

waterlooSectionSchema.methods.isFreed = haveSeatsFreed;

const WaterlooSection = Section.discriminator("WaterlooSection", waterlooSectionSchema);

module.exports = WaterlooSection;
