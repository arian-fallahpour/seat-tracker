import React, { useContext, useEffect } from "react";
import classes from "./GlobalError.module.scss";
import GlobalError from "./GlobalError";
import { GlobalErrorContext } from "@/store/global-error-context";
import { useQueryParams } from "@/hooks/use-query-params";
import { AnimatePresence } from "motion/react";

const GlobalErrors = () => {
  const queryParams = useQueryParams();
  const { globalErrors, pushGlobalError, popGlobalError } = useContext(GlobalErrorContext);

  useEffect(() => {
    const error = queryParams.get("error");
    if (typeof error === "string" && error.trim() !== "") {
      pushGlobalError(error);
      queryParams.delete("error");
    }
  }, []);

  const firstThreeErrors = globalErrors.slice(0, 3);

  return (
    <div className={classes.GlobalErrors}>
      <AnimatePresence>
        {firstThreeErrors.map((error, index) => (
          <GlobalError
            key={error.key}
            index={index}
            message={error.message}
            onClose={popGlobalError}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GlobalErrors;
