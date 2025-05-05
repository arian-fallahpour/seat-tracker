"use client";

import React, { Suspense } from "react";
import { join } from "@/utils/helper-client";
import PageHeader from "./PageHeader";
import Providers from "../Providers";
import GlobalErrors from "../GlobalError/GlobalErrors";
import GlobalSuccess from "../GlobalSuccess/GlobalSuccess";

const Page = ({
  className,
  children,
  includeBackButton = false,
  includeHomeButton = false,
  ...otherProps
}) => {
  return (
    <Providers>
      <Suspense>
        <GlobalSuccess />
        <GlobalErrors />
      </Suspense>
      <main className={join("main", className)} {...otherProps}>
        <PageHeader includeBackButton={includeBackButton} includeHomeButton={includeHomeButton} />
        {children}
      </main>
    </Providers>
  );
};

export default Page;
