const mongoose = require("mongoose");
const { validateSeatsTaken } = require("../../utils/validators");
const Section = require("./sectionModel");

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
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

uoftSectionSchema.virtual("seatsEmpty").get(function () {
  return this.seatsAvailable - this.seatsTaken;
});

// Checks if seats have been re-opened if all have previously been taken
uoftSectionSchema.methods.isFreed = function (updatedAlert) {
  const updatedSeatsEmpty = updatedAlert.seatsAvailable - updatedAlert.seatsTaken;
  return this.seatsEmpty === 0 && updatedSeatsEmpty !== 0;
};

const UoftSection = Section.discriminator("UoftSection", uoftSectionSchema);

module.exports = UoftSection;
