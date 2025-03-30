import React, { useContext } from "react";
import classes from "./GlobalError.module.scss";
import GlobalError from "./GlobalError";
import { GlobalErrorContext } from "@/store/global-error-context";

const GlobalErrors = () => {
  const { globalError, setGlobalError } = useContext(GlobalErrorContext);

  return (
    <div className={classes.GlobalErrors}>
      {!!globalError && <GlobalError message={globalError} setGlobalError={setGlobalError} />}
    </div>
  );
};

export default GlobalErrors;
