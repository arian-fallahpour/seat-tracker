const UoftSectionModel = require("../../../../models/Section/UoftSectionModel");

test("should be true if previously taken, but now free", () => {
  const section = new UoftSectionModel({ seatsAvailable: 55, seatsTaken: 55 });
  const updatedSection = {
    seatsAvailable: section.seatsAvailable,
    seatsTaken: 50,
  };

  const isFreed = section.isFreed(updatedSection);
  expect(isFreed).toEqual(true);
});

test("should be false if previously taken, and still taken", () => {
  const section = new UoftSectionModel({ seatsAvailable: 55, seatsTaken: 55 });
  const updatedSection = {
    seatsAvailable: section.seatsAvailable,
    seatsTaken: 55,
  };

  const isFreed = section.isFreed(updatedSection);
  expect(isFreed).toEqual(false);
});

test("should be false if previously free, but now taken", () => {
  const section = new UoftSectionModel({ seatsAvailable: 55, seatsTaken: 50 });
  const updatedSection = {
    seatsAvailable: section.seatsAvailable,
    seatsTaken: 55,
  };

  const isFreed = section.isFreed(updatedSection);
  expect(isFreed).toEqual(false);
});

test("should be false if previously free, and now free", () => {
  const section = new UoftSectionModel({ seatsAvailable: 55, seatsTaken: 50 });
  const updatedSection = {
    seatsAvailable: section.seatsAvailable,
    seatsTaken: 45,
  };

  const isFreed = section.isFreed(updatedSection);
  expect(isFreed).toEqual(false);
});
