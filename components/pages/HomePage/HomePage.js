import React from "react";
import Page from "@/components/elements/Page/Page";
import classes from "./HomePage.module.scss";
import Search from "./Search/Search";
import Header from "@/components/elements/Header/Header";

const HomePage = async () => {
  return (
    <Page>
      <div className={classes.Content}>
        <Header />
        <Search />
      </div>
    </Page>
  );
};

export default HomePage;
