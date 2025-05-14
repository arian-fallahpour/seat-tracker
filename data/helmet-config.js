const helmetConfig = {
  useDefaults: true,
  directives: {
    defaultSrc: ["'self'"],
    // scriptSrc: ["'self'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
    // imgSrc: ["'self'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
    // connectSrc: ["'self'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
    // styleSrc: [
    //   "'self'",
    //   "'unsafe-inline'",
    //   "https://www.googletagmanager.com",
    //   "https://www.google-analytics.com",
    // ],
    // frameSrc: ["'self'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
    // fontSrc: ["'self'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
    // objectSrc: ["'none'"], // Safer default
    // upgradeInsecureRequests: [],
  },
};
export default helmetConfig;
