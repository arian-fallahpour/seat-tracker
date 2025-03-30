import React from "react";
import classes from "./GlobalError.module.scss";
import { ErrorIcon } from "../icons/ErrorIcon";
import { join } from "@/utils/helper-client";
import { CloseIcon } from "../icons/CloseIcon";
import Button from "../Button/Button";

const Error = ({ message, setGlobalError }) => {
  return (
    <div className={classes.GlobalError}>
      <ErrorIcon className={classes.GlobalErrorIcon} />
      <p className={join("paragraph", classes.GlobalErrorMessage)}>{message}</p>
      <Button
        variant="icon"
        className={classes.GlobalErrorClose}
        onClick={() => setGlobalError(null)}
      >
        <CloseIcon />
      </Button>
    </div>
  );
};

export default Error;
