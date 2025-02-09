const UoftSection = require("../../models/database/uoftSectionModel");

describe("isFreed", () => {
  it("should return true if new spot is available", () => {
    const section = {
      seatsEmpty: 0,
      isFreed: UoftSection.functions.isFreed,
    };

    const seatsTaken = 99;
    const seatsAvailable = 100;
    const result = section.isFreed({ seatsTaken, seatsAvailable });

    expect(result).toBe(true);
  });

  it("should return false if new spot is available, but there already was a spot available", () => {
    const section = {
      seatsEmpty: 1,
      isFreed: UoftSection.functions.isFreed,
    };

    const seatsTaken = 99;
    const seatsAvailable = 100;
    const result = section.isFreed({ seatsTaken, seatsAvailable });

    expect(result).toBe(false);
  });

  it("should return false if a spot is still not available", () => {
    const section = {
      seatsEmpty: 0,
      isFreed: UoftSection.functions.isFreed,
    };

    const seatsTaken = 100;
    const seatsAvailable = 100;
    const result = section.isFreed({ seatsTaken, seatsAvailable });

    expect(result).toBe(false);
  });

  it("should return false if a spot is no longer available", () => {
    const section = {
      seatsEmpty: 1,
      isFreed: UoftSection.functions.isFreed,
    };

    const seatsTaken = 100;
    const seatsAvailable = 100;
    const result = section.isFreed({ seatsTaken, seatsAvailable });

    expect(result).toBe(false);
  });
});
