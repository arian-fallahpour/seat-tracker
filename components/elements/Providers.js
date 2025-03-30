import { GlobalErrorProvider } from "@/store/global-error-context";
import React from "react";

const Providers = ({ children }) => {
  return <GlobalErrorProvider>{children}</GlobalErrorProvider>;
};

export default Providers;
