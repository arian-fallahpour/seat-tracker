import {
  courseSchoolValues,
  sectionTypeValues,
  SectionType,
  SectionModelType,
  SectionMethodsType,
} from "@/Types/ModelTypes";
import { FormattedUoftSectionType } from "@/Types/UoftTypes";
import { model, Schema } from "mongoose";

const sectionSchema = new Schema<SectionType, SectionModelType, SectionMethodsType>({
  course: {
    type: Schema.ObjectId,
    ref: "Course",
    required: [true, "Please provide a course associated with the section."],
  },
  school: {
    type: String,
    enum: {
      values: courseSchoolValues,
      message: "Please provide a valid school for this section.",
    },
    required: [true, "Please provide a school for the section."],
  },
  type: {
    type: String,
    required: [true, "Please provide a section type."],
    enum: {
      values: sectionTypeValues,
      message: "Please provide a valid section type.",
    },
  },
  number: {
    type: String,
    required: [true, "Please provide a section number."],
    maxLength: [50, "Section number cannot exceed 50 characters."],
  },
  tba: {
    type: Boolean,
    required: [true, "Please indicate if this section is TBA."],
    default: false,
  },
  seatsTaken: {
    type: Number,
    min: [0, "Seats taken cannot be negative."],
    validate: [
      {
        validator: function (this: any, v: number) {
          return !this.tba || v === null;
        },
        message: "Seats Taken must be null if section is TBA.",
      },
      {
        validator: function (this: any, v: number) {
          return !this.tba && v !== null;
        },
        message: "Seats Taken must be provided if section is not TBA.",
      },
      {
        validator: function (this: any, v: number) {
          return !this.tba && this.seatsTotal !== null && v <= this.seatsTotal;
        },
        message: "Seats Taken must be less than or equal to Seats Total.",
      },
    ],
  },
  seatsTotal: {
    type: Number,
    min: [0, "Total seats cannot be negative."],
    validate: [
      {
        validator: function (this: any, v: number) {
          return !this.tba && this.seatsTaken !== null;
        },
        message: "Seats Total must be provided if section is not TBA.",
      },
      {
        validator: function (this: any, v: number) {
          return !this.tba || v === null;
        },
        message: "Seats Total must be null if section is TBA.",
      },
    ],
  },
  hasWaitlist: {
    type: Boolean,
    validate: [
      {
        validator: function (this: any, v: boolean) {
          return !this.tba || v === null;
        },
        message: "Has Waitlist must be null if section is TBA.",
      },
      {
        validator: function (this: any, v: boolean) {
          return !this.tba && v !== null;
        },
        message: "Has Waitlist must be provided if section is not TBA.",
      },
    ],
  },
  waitlistCount: {
    type: Number,
    min: [0, "Waitlist count cannot be negative."],
    validate: [
      {
        validator: function (this: any, v: number) {
          return !this.tba || v === null;
        },
        message: "Waitlist Count must be null if section is TBA.",
      },
      {
        validator: function (this: any, v: number) {
          return !this.tba && this.hasWaitlist !== null;
        },
        message: "Waitlist Count must be provided if section is not TBA.",
      },
      {
        validator: function (this: any, v: number) {
          return (!this.tba && !this.hasWaitlist) || v === null;
        },
        message: "Waitlist Count must be null if there is no waitlist.",
      },
    ],
  },
  lastUpdatedAt: { type: Date, default: Date.now },
});

// sectionSchema.index({ course: 1, type: 1, number: 1 }, { unique: true });

sectionSchema.pre("save", function () {
  this.lastUpdatedAt = new Date(Date.now());
});

/**
 * STATICS
 */

/**
 * METHODS
 */

sectionSchema.methods.hasChanged = function (updated: FormattedUoftSectionType) {
  return (
    this.tba !== updated.tba ||
    (this.seatsTaken === this.seatsTotal && updated.seatsTaken < updated.seatsTotal) ||
    (this.seatsTaken < this.seatsTotal && updated.seatsTaken === updated.seatsTotal)
  );
};

sectionSchema.methods.hasFreedUp = function (updated: FormattedUoftSectionType) {
  if (this.tba || updated.tba) return false;

  return this.seatsTaken === this.seatsTotal && updated.seatsTaken < updated.seatsTotal;
};

const SectionModel = model<SectionType, SectionModelType>("Section", sectionSchema);

export default SectionModel;
