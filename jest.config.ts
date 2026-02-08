import type { Config } from "jest";

const config: Config = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  // Add other Jest config options as needed
};

export default config;
