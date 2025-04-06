import React from "react";
import { join } from "@/utils/helper-client";
import classes from "./Button.module.scss";
import Link from "next/link";
import Loader from "../Loader/Loader";

const Button = ({
  children,
  className,
  innerClassName,
  variant = "",
  isLoading,
  isLink,
  ...otherProps
}) => {
  const Tag = isLink ? Link : "button";
  return (
    <Tag className={join(className, classes.Button, classes["Button--" + variant])} {...otherProps}>
      <span className={join(classes.ButtonLoader, isLoading ? classes.visible : null)}>
        <Loader />
      </span>
      <span
        className={join(
          innerClassName,
          classes.ButtonChildren,
          !isLoading ? classes.visible : null
        )}
      >
        {children}
      </span>
    </Tag>
  );
};

export default Button;
