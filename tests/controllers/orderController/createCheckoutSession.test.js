jest.mock("../../../models/AlertModel");
jest.mock("../../../models/Course/UoftCourseModel");
jest.mock("../../../models/OrderModel");

const sessionMock = { id: "stripe_session_id", url: "stripe_session_url" };
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue(sessionMock),
      },
    },
  }));
});

const UoftCourseModel = require("../../../models/Course/UoftCourseModel");
const AppError = require("../../../utils/app/AppError");
const AlertModel = require("../../../models/AlertModel");
const OrderModel = require("../../../models/OrderModel");
const { createCheckoutSession } = require("../../../controllers/orderController");

test("should redirect to error handler if no email", async () => {
  const req = {
    body: {
      email: "test@example.com",
      sections: ["updated_section_id"],
    },
  };
  const res = {};
  const next = jest.fn();

  await createCheckoutSession(req, res, next);

  expect(next).toHaveBeenCalledWith(expect.any(AppError));
});

test("should redirect to error handler if no course", async () => {
  const req = {
    body: {
      course: "example_course_id",
      sections: ["updated_section_id"],
    },
  };
  const res = {};
  const next = jest.fn();

  await createCheckoutSession(req, res, next);

  expect(next).toHaveBeenCalledWith(expect.any(AppError));
});

test("should create alert if haven't found one", async () => {
  const req = {
    body: {
      email: "test@example.com",
      course: "example_course_id",
      sections: ["updated_section_id"],
    },
  };
  const res = {};
  const next = jest.fn();

  const mockCourse = { isEnrollable: jest.fn(() => true) };
  const mockAlert = { id: "alert123", status: "processing" };

  UoftCourseModel.findById.mockResolvedValue(mockCourse);
  AlertModel.findOne.mockResolvedValue(null); // no existing alert
  AlertModel.create.mockResolvedValue(mockAlert);

  await createCheckoutSession(req, res, next);

  expect(AlertModel.findOne).toHaveBeenCalled();
  expect(AlertModel.create).toHaveBeenCalledWith(req.body);
});

test("should update sections if found a processing alert", async () => {
  const req = {
    body: {
      email: "test@example.com",
      course: "example_course_id",
      sections: ["updated_section_id"],
    },
  };
  const res = {};
  const next = jest.fn();

  const mockAlert = {
    id: "alert123",
    status: "processing",
    sections: ["old_section_id"],
    save: jest.fn(),
  };

  AlertModel.findOne.mockResolvedValue(mockAlert);

  await createCheckoutSession(req, res, next);

  expect(AlertModel.findOne).toHaveBeenCalled();
  expect(mockAlert.sections).toEqual(["updated_section_id"]);
  expect(mockAlert.save).toHaveBeenCalled();
});

test("should throw error if alert is not processing", async () => {
  const req = {
    body: {
      email: "test@example.com",
      course: "example_course_id",
      sections: ["updated_section_id"],
    },
  };
  const res = {};
  const next = jest.fn();

  const mockAlert = {
    id: "alert123",
    status: "active",
    sections: ["old_section_id"],
  };

  AlertModel.findOne.mockResolvedValue(mockAlert);

  await createCheckoutSession(req, res, next);

  expect(AlertModel.findOne).toHaveBeenCalled();
  expect(next).toHaveBeenCalledWith(expect.any(AppError));
});

test("should create order if not found", async () => {
  const req = {
    body: {
      email: "test@example.com",
      course: "example_course_id",
      sections: ["updated_section_id"],
    },
  };
  const res = {};
  const next = jest.fn();

  const mockAlert = {
    id: "alert123",
    status: "processing",
    sections: ["old_section_id"],
    save: jest.fn(),
  };

  const mockOrder = {};

  AlertModel.findOne.mockResolvedValue(mockAlert);
  OrderModel.findOne.mockResolvedValue(null);
  OrderModel.create.mockResolvedValue(mockOrder);

  await createCheckoutSession(req, res, next);

  expect(OrderModel.findOne).toHaveBeenCalled();
  expect(OrderModel.create).toHaveBeenCalledWith({ alert: mockAlert.id });
});

test("should throw error if already fulfilled", async () => {
  const req = {
    body: {
      email: "test@example.com",
      course: "example_course_id",
      sections: ["updated_section_id"],
    },
  };
  const res = {};
  const next = jest.fn();

  const mockAlert = {
    id: "alert123",
    status: "processing",
    sections: ["old_section_id"],
    save: jest.fn(),
  };

  const mockOrder = {
    isFulfilled: true,
  };

  AlertModel.findOne.mockResolvedValue(mockAlert);
  OrderModel.findOne.mockResolvedValue(mockOrder);

  await createCheckoutSession(req, res, next);

  expect(OrderModel.findOne).toHaveBeenCalled();
  expect(next).toHaveBeenCalledWith(expect.any(AppError));
});

test("should save stripe session id and return it in response", async () => {
  const req = {
    protocol: "https", // must be here
    headers: { host: "localhost:3000" }, // must be here
    body: {
      email: "test@example.com",
      course: "example_course_id",
      sections: ["updated_section_id"],
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  const mockAlert = {
    id: "alert123",
    status: "processing",
    sections: ["old_section_id"],
    save: jest.fn(),
  };

  const mockOrder = {
    save: jest.fn(),
    isFulfilled: false,
    stripeSessionId: undefined,
  };

  AlertModel.findOne.mockResolvedValue(mockAlert);
  OrderModel.findOne.mockResolvedValue(mockOrder);

  await createCheckoutSession(req, res, next);

  expect(mockOrder.stripeSessionId).toEqual(sessionMock.id);
  expect(mockOrder.save).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    status: "success",
    data: {
      stripeSessionUrl: sessionMock.url,
    },
  });
});
