import { createContext, useState } from "react";

const errorTimeout = 2000;

export const GlobalErrorContext = createContext({
  globalError: null,
  setGlobalError: (error) => {},
});

export const GlobalErrorProvider = ({ children }) => {
  const [globalError, setGlobalError] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);

  const setGlobalErrorHandler = (error) => {
    if (error === null) {
      return setGlobalError(null);
    }

    setGlobalError(error.message);

    const id = setTimeout(() => setGlobalError(null), errorTimeout);
    if (timeoutId !== null) clearTimeout(timeoutId);
    setTimeoutId(id);
  };

  const globalErrorContext = {
    globalError,
    setGlobalError: setGlobalErrorHandler,
  };

  return (
    <GlobalErrorContext.Provider value={globalErrorContext}>{children}</GlobalErrorContext.Provider>
  );
};
