const UoftSection = require("../../models/database/uoftSectionModel");

it("should return true if new spot is available", () => {
  const section = {
    seatsEmpty: 0,
    haveSeatsReopened: UoftSection.functions.haveSeatsReopened,
  };

  const newSeatsTaken = 99;
  const newSeatsAvailable = 100;
  const result = section.haveSeatsReopened(newSeatsTaken, newSeatsAvailable);

  expect(result).toBe(true);
});

it("should return false if new spot is available, but there already was a spot available", () => {
  const section = {
    seatsEmpty: 1,
    haveSeatsReopened: UoftSection.functions.haveSeatsReopened,
  };

  const newSeatsTaken = 99;
  const newSeatsAvailable = 100;
  const result = section.haveSeatsReopened(newSeatsTaken, newSeatsAvailable);

  expect(result).toBe(false);
});

it("should return false if a spot is still not available", () => {
  const section = {
    seatsEmpty: 0,
    haveSeatsReopened: UoftSection.functions.haveSeatsReopened,
  };

  const newSeatsTaken = 100;
  const newSeatsAvailable = 100;
  const result = section.haveSeatsReopened(newSeatsTaken, newSeatsAvailable);

  expect(result).toBe(false);
});

it("should return false if a spot is no longer available", () => {
  const section = {
    seatsEmpty: 1,
    haveSeatsReopened: UoftSection.functions.haveSeatsReopened,
  };

  const newSeatsTaken = 100;
  const newSeatsAvailable = 100;
  const result = section.haveSeatsReopened(newSeatsTaken, newSeatsAvailable);

  expect(result).toBe(false);
});
