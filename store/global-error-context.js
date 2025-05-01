const { createContext, useState, useEffect, useRef } = require("react");

const errorTimeout = 2000;

export const GlobalErrorContext = createContext({
  globalErrors: [],
  pushGlobalError: (message) => {},
  popGlobalError: () => {},
});

export const GlobalErrorProvider = ({ children }) => {
  const [globalErrors, setGlobalErrors] = useState([]);
  const timeoutId = useRef(null);

  useEffect(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    if (globalErrors.length > 0) {
      const id = setTimeout(() => popGlobalError(), errorTimeout);
      timeoutId.current = id;
    }
  }, [globalErrors]);

  const pushGlobalError = (message) => {
    setGlobalErrors((prev) => [...prev, message]);
  };

  const popGlobalError = () => {
    setGlobalErrors((prev) => prev.slice(1, prev.length));
  };

  const globalErrorContext = {
    globalErrors,
    pushGlobalError,
    popGlobalError,
  };

  return (
    <GlobalErrorContext.Provider value={globalErrorContext}>{children}</GlobalErrorContext.Provider>
  );
};
