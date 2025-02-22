import React from "react";
import classes from "./Section.module.scss";
import { join } from "@/utils/helper-client";

const Section = ({ children, className, ...otherProps }) => {
  return (
    <section className={join(classes.Section, className)} {...otherProps}>
      {children}
    </section>
  );
};

export default Section;
