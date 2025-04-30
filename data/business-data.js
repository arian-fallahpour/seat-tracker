const businessData = {
  name: "Uni Tracker",
  stripe: {
    alertPriceID:
      process.env.NODE_ENV === "development"
        ? "price_1QvAO6GLcRGY5lHyxO59Lvkv"
        : "price_1RJjmjGLcRGY5lHyqwrVrMmr",
  },
};
module.exports = businessData;
