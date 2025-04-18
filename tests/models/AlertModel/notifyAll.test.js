const AlertModel = require("../../../models/AlertModel");

test("should continue sending notifications after error", async () => {
  const alerts = [
    {
      notify: jest.fn(),
    },
    {
      notify: jest.fn().mockRejectedValue(new Error("Mocked failure")),
    },
    {
      notify: jest.fn(),
    },
  ];

  await AlertModel.notifyAll(alerts);

  expect(alerts[0].notify).toBeCalled();
  expect(alerts[1].notify).toBeCalled();
  expect(alerts[2].notify).toBeCalled();
});
