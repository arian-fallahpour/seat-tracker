import React from "react";
import Page from "@/components/elements/Page/Page";
import NotFoundSection from "@/components/layout/sections/NotFoundSection/NotFoundSection";

const NotFoundPage = () => {
  return (
    <Page includeHomeButton>
      <NotFoundSection />
    </Page>
  );
};

export default NotFoundPage;
