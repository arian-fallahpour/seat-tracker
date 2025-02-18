import React from "react";
import { join } from "@/utils/helper";
import classes from "./Button.module.scss";

const Button = ({ children, className, variant = "", ...otherProps }) => {
  return (
    <button className={join(classes.Button, classes[variant], className)} {...otherProps}>
      {children}
    </button>
  );
};

export default Button;
