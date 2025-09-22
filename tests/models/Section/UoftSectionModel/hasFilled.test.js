const UoftSectionModel = require("../../../../models/Section/UoftSectionModel");

test("Should return true if section is now full", () => {
  const section = new UoftSectionModel({
    seatsTaken: 5,
    seatsAvailable: 10,
  });

  const updatedSection = {
    seatsTaken: 10,
    seatsAvailable: 10,
  };

  const hasFilled = section.hasFilled(updatedSection);
  expect(hasFilled).toBe(true);
});

test("Should return false if section is still open", () => {
  const section = new UoftSectionModel({
    seatsTaken: 5,
    seatsAvailable: 10,
  });

  const updatedSection = {
    seatsTaken: 5,
    seatsAvailable: 10,
  };

  const hasFilled = section.hasFilled(updatedSection);
  expect(hasFilled).toBe(false);
});

test("Should return false if section is now open", () => {
  const section = new UoftSectionModel({
    seatsTaken: 10,
    seatsAvailable: 10,
  });

  const updatedSection = {
    seatsTaken: 5,
    seatsAvailable: 10,
  };

  const hasFilled = section.hasFilled(updatedSection);
  expect(hasFilled).toBe(false);
});
