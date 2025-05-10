import React from "react";
import classes from "./SearchSection.module.scss";
import Section from "@/components/elements/Section/Section";
import Search from "./Search/Search";
import { join } from "@/utils/helper-client";
import { getEnrollableSeasons } from "../../../../utils/app/schema-utils";
import InfoIcon from "@/components/elements/icons/InfoIcon";
import businessData from "@/data/business-data";

const SearchSection = ({ className }) => {
  const isEnrollmentOpen = getEnrollableSeasons().length > 0;

  return (
    <Section className={join(className, classes.SearchSection)}>
      <header className={classes.Header}>
        <div className={classes.HeaderImage}>
          <img src="/logo.svg" />
        </div>
        <div className={classes.HeaderContent}>
          <h1 className="header header-title">{businessData.name}</h1>
          <p className="paragraph">
            Create a waitlist that sends email alerts for UofT courses that are full and don't have
            one!
          </p>
        </div>
      </header>
      <Search isDisabled={!isEnrollmentOpen} />
      {!isEnrollmentOpen && (
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
