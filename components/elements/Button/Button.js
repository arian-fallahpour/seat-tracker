import React from "react";
import { join } from "@/utils/helper-client";
import classes from "./Button.module.scss";
import Link from "next/link";

const Button = ({ children, className, variant = "", isLink, ...otherProps }) => {
  const Tag = isLink ? Link : "button";
  return (
    <Tag className={join(classes.Button, classes["Button--" + variant], className)} {...otherProps}>
      {children}
    </Tag>
  );
};

export default Button;
