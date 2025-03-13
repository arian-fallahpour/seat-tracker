"use client";

import React, { Fragment } from "react";
import { join } from "@/utils/helper-client";
import PageHeader from "./PageHeader";

const Page = ({
  className,
  children,
  includeBackButton = false,
  includeHomeButton = false,
  ...otherProps
}) => {
  return (
    <Fragment>
      <main className={join("main", className)} {...otherProps}>
        <PageHeader includeBackButton={includeBackButton} includeHomeButton={includeHomeButton} />
        {children}
      </main>
    </Fragment>
  );
};

export default Page;
