import React from "react";
import Page from "@/components/elements/Page/Page";
import classes from "./HomePage.module.scss";
import Search from "./Search/Search";
import Header from "@/components/elements/Header/Header";
import AlertsCount from "./AlertsCount/AlertsCount";

const HomePage = async ({ alertsCount }) => {
  return (
    <Page>
      <div className={classes.Content}>
        <Header />
        <Search />
        {alertsCount !== null && <AlertsCount count={alertsCount} />}
      </div>
    </Page>
  );
};

export default HomePage;
