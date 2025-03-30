import mongoose from "mongoose";
import {
  validateSeatsTaken,
  calculateEmptySeats,
  haveSeatsFreed,
} from "../../../utils/schema-utils.js";
import Section from "./Section.js";

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

waterlooSectionSchema.methods.isFreed = haveSeatsFreed;

const WaterlooSection = Section.discriminator("WaterlooSection", waterlooSectionSchema);

export default WaterlooSection;
