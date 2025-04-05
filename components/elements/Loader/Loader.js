import React from "react";
import classes from "./Loader.module.scss";
import LoaderIcon from "@/components/elements/icons/LoaderIcon";
import { join } from "@/utils/helper-client";

const Loader = ({ className, ...otherProps }) => {
  return <LoaderIcon className={join(className, classes.Loader)} {...otherProps} />;
};

export default Loader;
