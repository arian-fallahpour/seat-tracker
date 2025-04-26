const config = {
  API_PATH: "api/v1",
  STRIPE_PUBLIC_KEY:
    process.env.NODE_ENV === "development"
      ? "pk_test_51QvA1yGLcRGY5lHyD8lxAaGNbDAiVKXYnXN6rg0SPeVeUg2WcANdSJ4B1R7w1LyGSvZiofVhOALQoJXzOCFfYGm7008j66Tjbu"
      : "pk_live_51QvA1yGLcRGY5lHyKSOjhcLD8Zaaa4FZyJWhtHCpp7SdWN810szHak0yeyUy7he0aCD0YikPNlrePhIhIIA996pf00llsmS19Z",
};

module.exports = config;
