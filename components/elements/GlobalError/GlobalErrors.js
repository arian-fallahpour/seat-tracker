import React, { useContext, useEffect } from "react";
import classes from "./GlobalError.module.scss";
import GlobalError from "./GlobalError";
import { GlobalErrorContext } from "@/store/global-error-context";
import { useRouter, useSearchParams } from "next/navigation";
import { removeParam } from "@/utils/helper-client";

// TODO: Fix animation + multiple errors + no more new Error(), just put the message
const GlobalErrors = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { globalError, setGlobalError } = useContext(GlobalErrorContext);

  useEffect(() => {
    const errorMessage = searchParams.get("error");
    if (errorMessage) {
      setGlobalError(new Error(errorMessage));
      removeParam(searchParams, router, "error");
    }
  }, []);

  return (
    <div className={classes.GlobalErrors}>
      {!!globalError && <GlobalError message={globalError} setGlobalError={setGlobalError} />}
    </div>
  );
};

export default GlobalErrors;
