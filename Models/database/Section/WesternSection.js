const mongoose = require("mongoose");
const Section = require("./Section");

const westernSectionSchema = new mongoose.Schema(
  {
    isFull: {
      type: Boolean,
      required: [true, "Please indicate if section is full or not."],
      default: false,
    },
    hasWaitlist: {
      type: Boolean,
      required: [true, "Waitlist availabilty is required."],
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * METHODS
 */

// Checks if seats have been re-opened if all have previously been taken
uoftSectionSchema.methods.isFreed = function (updatedSection) {
  return this.isFull && !updatedSection.isFull;
};

const WesternSection = Section.discriminator("WesternSection", westernSectionSchema);

module.exports = WesternSection;
