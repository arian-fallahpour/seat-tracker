"use client";

import React, { Fragment } from "react";
import classes from "./Page.module.scss";
import Button from "../Button/Button";

import { BackIcon } from "../icons/backIcon";

import { join } from "@/utils/helper-client";
import { useRouter } from "next/navigation";

const Page = ({ className, children, includeBackButton = false, ...otherProps }) => {
  const router = useRouter();

  return (
    <Fragment>
      <main className={join("main", className)} {...otherProps}>
        <div className={classes.Header}>
          {includeBackButton && (
            <Button variant="text" className={classes.Back} onClick={() => router.back()}>
              <BackIcon /> back
            </Button>
          )}
        </div>
        {children}
      </main>
    </Fragment>
  );
};

export default Page;
