const AlertModel = require("../../../models/AlertModel");

test("Should populate if not populated", async () => {
  const updatedCourse = { code: "abc", sections: [{ type: "lab", number: "1" }] };

  const alert = {};
  alert.populated = jest.fn(() => false);
  alert.populate = jest.fn().mockImplementation(async () => {
    alert.sections = [];
  });

  await AlertModel.schema.methods.getFreedSections.call(alert, updatedCourse);

  expect(alert.populated).toHaveBeenCalled();
  expect(alert.populate).toHaveBeenCalled();
});

test("should populate if sections undefined/null", async () => {
  const updatedCourse = { code: "abc", sections: [{ type: "lab", number: "1" }] };

  const alert = {};
  alert.sections = undefined;
  alert.populated = jest.fn(() => true);
  alert.populate = jest.fn().mockImplementation(async () => {
    alert.sections = [];
  });

  await AlertModel.schema.methods.getFreedSections.call(alert, updatedCourse);

  expect(alert.populated).toHaveBeenCalled();
  expect(alert.populate).toHaveBeenCalled();
});

test("shouldn't populate if already populated", async () => {
  const updatedCourse = { code: "abc", sections: [{ type: "lab", number: "1" }] };

  const alert = {};
  alert.sections = [];
  alert.populated = jest.fn(() => true);
  alert.populate = jest.fn();

  await AlertModel.schema.methods.getFreedSections.call(alert, updatedCourse);

  expect(alert.populated).toHaveBeenCalled();
  expect(alert.populate).not.toHaveBeenCalled();
});

test("should gracefully handle no updatedSection found", async () => {
  const isFreedMock = jest.fn();
  const updatedCourse = { code: "abc", sections: [] };

  const alert = {};
  alert.sections = [{ type: "lab", number: "1", isFreed: isFreedMock }];
  alert.populated = jest.fn(() => true);

  await AlertModel.schema.methods.getFreedSections.call(alert, updatedCourse);

  expect(isFreedMock).not.toHaveBeenCalled();
});

test("should filter sections that are not freed", async () => {
  const isFreedMock = jest.fn(() => true);
  const isNotFreedMock = jest.fn(() => false);

  const sections = [
    { type: "lab", number: "1", isFreed: isFreedMock },
    { type: "lab", number: "2", isFreed: isNotFreedMock },
    { type: "lab", number: "3", isFreed: isFreedMock },
  ];

  const updatedSections = sections.map((s) => ({ type: s.type, number: s.number }));
  const updatedCourse = { code: "abc", sections: updatedSections };

  const alert = {};
  alert.sections = sections;
  alert.populated = jest.fn(() => true);

  const freedSections = await AlertModel.schema.methods.getFreedSections.call(alert, updatedCourse);

  expect(freedSections).toHaveLength(2);
  expect(freedSections[0]).toMatchObject(updatedSections[0]);
  expect(freedSections[1]).toMatchObject(updatedSections[2]);
});
