import React from "react";
import classes from "./SearchSection.module.scss";
import Section from "@/components/elements/Section/Section";
import Search from "./Search/Search";
import { join } from "@/utils/helper-client";
import InfoIcon from "@/components/elements/icons/InfoIcon";

import { allowedToEnrol } from "@/data/alerts-data";

const SearchSection = ({ className }) => {
  return (
    <Section className={join(className, classes.SearchSection)}>
      <header className={classes.Header}>
        <h1 className="header header-title">Seat Tracker</h1>
        <p className="paragraph">
          Search for courses to send alerts from the University Of Toronto
        </p>
      </header>
      <Search isDisabled={!allowedToEnrol} />
      {!allowedToEnrol && (
        <div className={classes.Message}>
          <InfoIcon className={classes.MessageIcon} />
          <p className="paragraph">
            Enrollment is not currently open! Come back when it is to set up an alert.
          </p>
        </div>
      )}
    </Section>
  );
};

export default SearchSection;
