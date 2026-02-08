import alertsData from "@/data/alerts-data";
import {
  CourseMethodsType,
  CourseModelType,
  CourseType,
  CourseSchoolType,
  courseSchoolValues,
  UoftCampusType,
  UoftTermType,
  uoftCampusValues,
  uoftTermValues,
} from "@/Types/ModelTypes";
import mongoose, { model, Schema } from "mongoose";
import slugify from "slugify";

const courseSchema = new Schema<CourseType, CourseModelType, CourseMethodsType>({
  name: {
    type: String,
    required: [true, "Please provide a name for this course."],
    maxLength: [500, "Name cannot exceed 500 characters."],
    minLength: [3, "Name must be atleast 3 characters long."],
  },
  code: {
    type: String,
    required: [true, "Please provide a course code."],
    maxLength: [20, "Course code cannot exceed 20 characters."],
    minLength: [3, "Course code must be atleast 3 characters long."],
  },
  school: {
    type: String,
    enum: {
      values: courseSchoolValues,
      message: "Please provide a valid school for this course.",
    },
    required: [true, "Please provide the school for this course."],
  },
  campus: {
    type: String,
    required: [true, "Please provide the campus for this course."],
    validate: {
      validator: function (this: any, v: string) {
        if (this.school === "uoft") {
          return uoftCampusValues.includes(v as UoftCampusType);
        }
      },
      message: "Please provide a valid campus for this course.",
    },
  },
  sections: {
    type: [Schema.ObjectId],
    ref: "Section",
    default: [],
  },
  term: {
    type: String,
    required: [true, "Please provide the term for this course."],
    validate: {
      validator: function (this: any, v: string) {
        if (this.school === "uoft") {
          return uoftTermValues.includes(v as UoftTermType);
        }
        return true;
      },
      message: "Please provide a valid term for this course.",
    },
  },
  slug: String,
  lastUpdatedAt: { type: Date, default: Date.now },
});

courseSchema.index({ slug: 1 });

courseSchema.pre("save", function () {
  this.lastUpdatedAt = new Date(Date.now());
});

courseSchema.pre("save", function () {
  if (!this.slug || this.isNew || this.isModified("code")) {
    this.slug = slugify(this.code, { lower: true });
  }
});

/**
 * STATICS
 */

courseSchema.statics.getEnrollableTerms = function (school: CourseSchoolType): UoftTermType[] {
  const { enrollmentDates } = alertsData[school];

  if (school === "uoft") {
    const currentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // UTC-4 approximate for EST/EDT

    return Object.keys(enrollmentDates)
      .filter(
        (term: UoftTermType) =>
          enrollmentDates[term][0] < currentDate &&
          currentDate < new Date(enrollmentDates[term][1].getTime() + 24 * 60 * 60 * 1000),
      )
      .map((term) => term as UoftTermType);
  }

  return [];
};

courseSchema.statics.search = function (school: CourseSchoolType, query: string) {
  const regex = new RegExp(`^${query}`, "gi");

  return this.find({
    $or: [{ code: regex }, { name: regex }],
    school,
    term: { $in: CourseModel.getEnrollableTerms(school) },
  });
};

/**
 * METHODS
 */

// TEST
courseSchema.methods.isEnrollable = function () {
  return CourseModel.getEnrollableTerms(this.school).includes(this.term as UoftTermType);
};

const CourseModel =
  (mongoose.models.Course as CourseModelType) ||
  model<CourseType, CourseModelType>("Course", courseSchema);

export default CourseModel;
