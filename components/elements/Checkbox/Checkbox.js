import React from "react";
import classes from "./Checkbox.module.scss";
import { join } from "@/utils/helper-client";

const validTypes = ["checkbox", "radio"];

const Checkbox = ({ className, value, type, label, name, id, ...otherProps }) => {
  if (!validTypes.includes(type)) type = validTypes[0];

  return (
    <div className={join(classes.Checkbox, classes[`Checkbox--${type}`], className)}>
      <input
        className={classes.CheckboxInput}
        type={type}
        id={id}
        name={name}
        checked={!!value}
        {...otherProps}
      />
      <label className={classes.CheckboxMain} htmlFor={id}>
        <span className={classes.CheckboxBox}>
          <span className={classes.CheckboxCheck} />
        </span>
        <span className={classes.CheckboxLabel}>{label}</span>
      </label>
    </div>
  );
};

export default Checkbox;
