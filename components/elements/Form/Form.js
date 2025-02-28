import React from "react";
import classes from "./Form.module.scss";
import { join } from "@/utils/helper-client";

const Form = ({ className, children, ...otherProps }) => {
  return (
    <form className={join(classes.Form, className)} {...otherProps}>
      {children}
    </form>
  );
};

export default Form;

export const FormRow = ({ className, children, ...otherProps }) => {
  return (
    <div className={join(classes.FormRow, className)} {...otherProps}>
      {children}
    </div>
  );
};
