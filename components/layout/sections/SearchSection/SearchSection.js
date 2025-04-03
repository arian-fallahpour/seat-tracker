import React from "react";
import classes from "./SearchSection.module.scss";
import Section from "@/components/elements/Section/Section";
import Search from "./Search/Search";
import { join } from "@/utils/helper-client";

const SearchSection = ({ className }) => {
  return (
    <Section className={join(className, classes.SearchSection)}>
      <header className={classes.Header}>
        <h1 className="header header-title">Seat Tracker</h1>
        <p className="paragraph">
          Search for courses to send alerts from the University Of Toronto
        </p>
      </header>
      <Search />
    </Section>
  );
};

export default SearchSection;
