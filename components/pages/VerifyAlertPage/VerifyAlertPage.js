import React, { Suspense } from "react";
import Page from "@/components/elements/Page/Page";
import VerifyAlertSection from "../../layout/sections/VerifyAlertSection/VerifyAlertSection";

const VerifyAlertPage = () => {
  return (
    <Page>
      <Suspense>
        <VerifyAlertSection />
      </Suspense>
    </Page>
  );
};

export default VerifyAlertPage;
