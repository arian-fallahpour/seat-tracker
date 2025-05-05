import React from "react";
import classes from "./GlobalError.module.scss";
import ErrorIcon from "../icons/ErrorIcon";
import { join } from "@/utils/helper-client";
import CloseIcon from "../icons/CloseIcon";
import Button from "../Button/Button";

const Error = ({ className, message, onClose }) => {
  return (
    <div className={join(className, classes.GlobalError)}>
      <ErrorIcon className={classes.GlobalErrorIcon} />
      <p className={join("paragraph", classes.GlobalErrorMessage)}>{message}</p>
      <Button variant="icon" className={classes.GlobalErrorClose} onClick={() => onClose()}>
        <CloseIcon />
      </Button>
    </div>
  );
};

export default Error;
