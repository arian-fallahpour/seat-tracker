const businessData = {
  name: "Course Tracker",
  stripe: {
    alertPriceID:
      process.env.NODE_ENV === "development"
        ? "price_1QvAO6GLcRGY5lHyxO59Lvkv"
        : "price_1RJjmjGLcRGY5lHyqwrVrMmr",
  },
};
export default businessData;
