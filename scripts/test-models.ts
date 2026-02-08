import CourseModel from "@/models/CourseModel";
import SectionModel from "@/models/SectionModel";
import { SectionType } from "@/Types/ModelTypes";
import { HydratedDocument } from "mongoose";

try {
  const section: HydratedDocument<SectionType> = new SectionModel({
    number: "101",
    type: "lecture",
    course: new CourseModel()._id,
    school: "uoft",
    tba: false,
    seatsTaken: 1,
    seatsTotal: 1,
    hasWaitlist: true,
    waitlistCount: 0,
  });
  section.validate();
} catch (error) {
  console.error("Error fetching courses:", error);
}
