const mongoose = require("mongoose");
const {
  validateSeatsTaken,
  calculateEmptySeats,
  haveSeatsFreed,
} = require("../../../utils/schema-utils");
const Section = require("./Section");

const uoftSectionSchema = new mongoose.Schema(
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
      validator: {
        validate: function (waitlist) {
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

// TODO: Optimize this and updateCoursesBulk
uoftSectionSchema.statics.updateSectionsBulk = async function (updatedSections) {
  const queries = [];
  for (const updatedSection of updatedSections) {
    const query = UoftSection.findOneAndUpdate(
      {
        type: updatedSection.type,
        number: updatedSection.number,
        campus: updatedSection.campus,
      },
      updatedSection,
      { runValidators: true }
    );
    queries.push(query);
  }
  await Promise.all(queries);
};

/**
 * METHODS
 */

uoftSectionSchema.methods.isFreed = haveSeatsFreed;

const UoftSection = Section.discriminator("UoftSection", uoftSectionSchema);

module.exports = UoftSection;
