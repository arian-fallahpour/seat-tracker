import React from "react";
import Page from "@/components/elements/Page/Page";
import classes from "./HomePage.module.scss";
import SearchSection from "@/components/layout/sections/SearchSection/SearchSection";
import ActiveAlertsSection from "@/components/layout/sections/ActiveAlertsSection/ActiveAlertsSection";

const HomePage = async () => {
  return (
    <Page className={classes.Page}>
      <SearchSection className={classes.SearchSection} />
      <ActiveAlertsSection />
    </Page>
  );
};

export default HomePage;
