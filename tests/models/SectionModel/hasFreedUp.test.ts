import SectionModel from "@/models/SectionModel";
import mongoose from "mongoose";

test("should return true if previously full section is open", () => {
  const section = new SectionModel({
    course: new mongoose.Types.ObjectId(),
    school: "SC1",
    type: "lecture",
    number: 1,
    tba: false,
    seatsTaken: 30,
    seatsTotal: 30,
    hasWaitlist: false,
    waitlistCount: null,
  });

  const updatedSection = {
    course: section.course,
    school: section.school,
    type: section.type,
    number: section.number,
    tba: false,
    seatsTaken: 25,
    seatsTotal: 30,
    hasWaitlist: false,
    waitlistCount: null,
  };

  expect(section.hasFreedUp(updatedSection)).toBe(true);
});

test("should return false if section was not previously full and now full", () => {
  const section = new SectionModel({
    course: new mongoose.Types.ObjectId(),
    school: "SC1",
    type: "lecture",
    number: 1,
    tba: false,
    seatsTaken: 20,
    seatsTotal: 30,
    hasWaitlist: false,
    waitlistCount: null,
  });

  const updatedSection = {
    course: section.course,
    school: section.school,
    type: section.type,
    number: section.number,
    tba: false,
    seatsTaken: 30,
    seatsTotal: 30,
    hasWaitlist: false,
    waitlistCount: null,
  };

  expect(section.hasFreedUp(updatedSection)).toBe(false);
});

test("should return false if section was not previously full and still not full", () => {
  const section = new SectionModel({
    course: new mongoose.Types.ObjectId(),
    school: "SC1",
    type: "lecture",
    number: 1,
    tba: false,
    seatsTaken: 20,
    seatsTotal: 30,
    hasWaitlist: false,
    waitlistCount: null,
  });

  const updatedSection = {
    course: section.course,
    school: section.school,
    type: section.type,
    number: section.number,
    tba: false,
    seatsTaken: 21,
    seatsTotal: 30,
    hasWaitlist: false,
    waitlistCount: null,
  };

  expect(section.hasFreedUp(updatedSection)).toBe(false);
});

test("should return false if section was previously full and still full", () => {
  const section = new SectionModel({
    course: new mongoose.Types.ObjectId(),
    school: "SC1",
    type: "lecture",
    number: 1,
    tba: false,
    seatsTaken: 30,
    seatsTotal: 30,
    hasWaitlist: false,
    waitlistCount: null,
  });

  const updatedSection = {
    course: section.course,
    school: section.school,
    type: section.type,
    number: section.number,
    tba: false,
    seatsTaken: 30,
    seatsTotal: 30,
    hasWaitlist: false,
    waitlistCount: null,
  };

  expect(section.hasFreedUp(updatedSection)).toBe(false);
});

test("show return false if previous section was TBA", () => {
  const section = new SectionModel({
    course: new mongoose.Types.ObjectId(),
    school: "SC1",
    type: "lecture",
    number: 1,
    tba: true,
    seatsTaken: null,
    seatsTotal: null,
    hasWaitlist: null,
    waitlistCount: null,
  });

  const updatedSection = {
    course: section.course,
    school: section.school,
    type: section.type,
    number: section.number,
    tba: false,
    seatsTaken: 20,
    seatsTotal: 30,
    hasWaitlist: false,
    waitlistCount: null,
  };

  expect(section.hasFreedUp(updatedSection)).toBe(false);
});

test("show return false if updated section is TBA", () => {
  const section = new SectionModel({
    course: new mongoose.Types.ObjectId(),
    school: "SC1",
    type: "lecture",
    number: 1,
    tba: false,
    seatsTaken: 30,
    seatsTotal: 30,
    hasWaitlist: false,
    waitlistCount: null,
  });

  const updatedSection = {
    course: section.course,
    school: section.school,
    type: section.type,
    number: section.number,
    tba: true,
    seatsTaken: null,
    seatsTotal: null,
    hasWaitlist: null,
    waitlistCount: null,
  };

  expect(section.hasFreedUp(updatedSection)).toBe(false);
});
