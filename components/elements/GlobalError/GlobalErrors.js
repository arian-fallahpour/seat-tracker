import React, { useContext, useEffect } from "react";
import classes from "./GlobalError.module.scss";
import GlobalError from "./GlobalError";
import { GlobalErrorContext } from "@/store/global-error-context";
import { useRouter, useSearchParams } from "next/navigation";
import { removeParam } from "@/utils/helper-client";

const GlobalErrors = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { globalErrors, pushGlobalError, popGlobalError } = useContext(GlobalErrorContext);

  useEffect(() => {
    const error = searchParams.get("error");
    if (typeof error === "string" && error.trim() !== "") {
      pushGlobalError(error);
      removeParam(searchParams, router, "error");
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
