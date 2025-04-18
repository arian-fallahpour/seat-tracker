const mongoose = require("mongoose");

const Section = require("./SectionModel");
const {
  validateSeatsTaken,
  calculateEmptySeats,
  upsertSections,
} = require("../../utils/app/schema-utils");

const uoftSectionSchema = new mongoose.Schema(
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
    hasWaitlist: {
      type: Boolean,
      required: [true, "Waitlist availabilty is required."],
      default: false,
    },
    waitlist: {
      type: Number,
      required: [true, "Waitlist count is required."],
      default: 0,
      min: [0, "Waitlist count cannot be a negative number."],
      validate: {
        validator: function (waitlist) {
          return this.hasWaitlist || waitlist === 0;
        },
        message: "Cannot add to waitlist if section does not have a waitlist.",
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

uoftSectionSchema.virtual("seatsEmpty").get(calculateEmptySeats);

/**
 * STATICS
 */

uoftSectionSchema.statics.upsertSections = async function (sectionsData) {
  return await upsertSections(this)(sectionsData);
};

/**
 * METHODS
 */

uoftSectionSchema.methods.isFreed = function (updatedSection) {
  const seatsEmptyUpdated = updatedSection.seatsAvailable - updatedSection.seatsTaken;
  return this.seatsEmpty === 0 && seatsEmptyUpdated !== 0;
};

const UoftSection =
  mongoose.models?.UoftSection || Section.discriminator("UoftSection", uoftSectionSchema);

/**
 * STATICS
 */

module.exports = UoftSection;
