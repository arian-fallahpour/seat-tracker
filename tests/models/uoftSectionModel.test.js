const UoftSection = require("../../models/database/Section/UoftSection");

describe("isFreed", () => {
  it("should return true if new spot is available", () => {
    const section = {
      seatsEmpty: 0,
      isFreed: UoftSection.schema.methods.isFreed,
    };

    const updatedSection = {
      seatsTaken: 99,
      seatsAvailable: 100,
    };

    const result = section.isFreed(updatedSection);

    expect(result).toBe(true);
  });

  it("should return false if new spot is available, but there already was a spot available", () => {
    const section = {
      seatsEmpty: 1,
      isFreed: UoftSection.schema.methods.isFreed,
    };

    const updatedSection = {
      seatsTaken: 99,
      seatsAvailable: 100,
    };

    const result = section.isFreed(updatedSection);

    expect(result).toBe(false);
  });

  it("should return false if a spot is still not available", () => {
    const section = {
      seatsEmpty: 0,
      isFreed: UoftSection.schema.methods.isFreed,
    };

    const updatedSection = {
      seatsTaken: 100,
      seatsAvailable: 100,
    };

    const result = section.isFreed(updatedSection);

    expect(result).toBe(false);
  });

  it("should return false if a spot is no longer available", () => {
    const section = {
      seatsEmpty: 1,
      isFreed: UoftSection.schema.methods.isFreed,
    };

    const updatedSection = {
      seatsTaken: 100,
      seatsAvailable: 100,
    };

    const result = section.isFreed(updatedSection);

    expect(result).toBe(false);
  });
});
