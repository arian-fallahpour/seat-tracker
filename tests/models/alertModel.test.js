const Alert = require("../../models/database/Alert");

const { getFreedSections } = Alert.schema.methods;

describe("getFreedSections", () => {
  let alertInstance;

  beforeEach(() => {
    // Mocking the populate method
    alertInstance = {
      populate: jest.fn().mockResolvedValue(),
      sections: [],
      getFreedSections,
    };
  });

  it("should filter sections that have been freed up", async () => {
    const updatedSections = [
      { type: "LEC", number: "0101", spots: 10 },
      { type: "TUT", number: "0102", spots: 0 },
    ];

    alertInstance.sections = [
      {
        type: "LEC",
        number: "0101",
        isFreed: jest.fn((updatedSection) => updatedSection.spots > 0),
      },
      {
        type: "TUT",
        number: "0102",
        isFreed: jest.fn((updatedSection) => updatedSection.spots > 0),
      },
    ];

    const result = await alertInstance.getFreedSections(updatedSections);

    expect(alertInstance.populate).toHaveBeenCalledWith("sections");
    expect(alertInstance.sections[0].isFreed).toHaveBeenCalledWith(updatedSections[0]);
    expect(alertInstance.sections[1].isFreed).toHaveBeenCalledWith(updatedSections[1]);
    expect(result).toEqual([alertInstance.sections[0]]);
  });

  it("should return 0 freed sections if no section has been freed up", async () => {
    const updatedSections = [
      { type: "LEC", number: "0101", spots: 0 },
      { type: "TUT", number: "0102", spots: 0 },
    ];

    alertInstance.sections = [
      {
        type: "LEC",
        number: "0101",
        isFreed: jest.fn((updatedSection) => updatedSection.spots > 0),
      },
      {
        type: "TUT",
        number: "0102",
        isFreed: jest.fn((updatedSection) => updatedSection.spots > 0),
      },
    ];

    const result = await alertInstance.getFreedSections(updatedSections);

    expect(alertInstance.populate).toHaveBeenCalledWith("sections");
    expect(alertInstance.sections[0].isFreed).toHaveBeenCalledWith(updatedSections[0]);
    expect(alertInstance.sections[1].isFreed).toHaveBeenCalledWith(updatedSections[1]);
    expect(result).toEqual([]);
  });
});
