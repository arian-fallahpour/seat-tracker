const UoftSectionModel = require("../../../../models/Section/UoftSectionModel");

test("Should return true if section is no longer full", () => {
  const section = new UoftSectionModel({
    seatsTaken: 10,
    seatsAvailable: 10,
  });

  const updatedSection = {
    seatsTaken: 5,
    seatsAvailable: 10,
  };

  const hasOpened = section.hasOpened(updatedSection);
  expect(hasOpened).toBe(true);
});

test("Should return false if section is still full", () => {
  const section = new UoftSectionModel({
    seatsTaken: 10,
    seatsAvailable: 10,
  });

  const updatedSection = {
    seatsTaken: 10,
    seatsAvailable: 10,
  };

  const hasOpened = section.hasOpened(updatedSection);
  expect(hasOpened).toBe(false);
});

test("Should return false if section is now full", () => {
  const section = new UoftSectionModel({
    seatsTaken: 5,
    seatsAvailable: 10,
  });

  const updatedSection = {
    seatsTaken: 10,
    seatsAvailable: 10,
  };

  const hasOpened = section.hasOpened(updatedSection);
  expect(hasOpened).toBe(false);
});
