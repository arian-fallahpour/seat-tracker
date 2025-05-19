import React, { useContext, useEffect } from "react";
import classes from "./GlobalError.module.scss";
import GlobalError from "./GlobalError";
import { GlobalErrorContext } from "@/store/global-error-context";
import { useQueryParams } from "@/hooks/use-query-params";

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
      {firstThreeErrors.map((error) => (
        <GlobalError key={error.key} message={error.message} onClose={popGlobalError} />
      ))}
    </div>
  );
};

export default GlobalErrors;
