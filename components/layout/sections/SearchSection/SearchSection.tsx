import classes from "./SearchSection.module.scss";

import Section from "@/components/elements/Section/Section";
import Search from "./Search/Search";
import InfoIcon from "@/components/elements/icons/InfoIcon";

import businessData from "@/data/business-data";
import { join } from "@/utils/helper-client";

import CourseModel from "@/models/CourseModel";
import { UoftTermType } from "@/Types/ModelTypes";

const SearchSection = ({ className }: { className?: string }) => {
  const enrollableTerms = CourseModel.getEnrollableTerms("uoft");

  const isEnrollmentOpen = enrollableTerms.length > 0;

  return (
    <Section className={join(className, classes.SearchSection)}>
      <header className={classes.Header}>
        <div className={classes.HeaderImage}>
          <img src="/logo.svg" alt="Course Tracker Logo" />
        </div>
        <div className={classes.HeaderContent}>
          <h1 className="header header-title">{businessData.name}</h1>
          <p className="paragraph">
            Create a waitlist that sends email alerts for UofT courses that don't have one!
          </p>
        </div>
      </header>
      <Search isDisabled={!isEnrollmentOpen} />
      {isEnrollmentOpen && (
        <div className={classes.Message}>
          <InfoIcon className={classes.MessageIcon} />
          <p className="paragraph">
            Course selection is currently open for the following sessions:
            {" " + enrollableTerms.map(formatTerm).join(", ")}
          </p>
        </div>
      )}
      {!isEnrollmentOpen && (
        <div className={classes.Message}>
          <InfoIcon className={classes.MessageIcon} />
          <p className="paragraph">
            Course selection is not currently open! Come back when it is to set up an alert.
          </p>
        </div>
      )}
    </Section>
  );
};

export default SearchSection;

function formatTerm(term: UoftTermType): string {
  if (term === "fall-winter") return "fall/winter";
  if (term.startsWith("summer")) {
    const split = term.split("-");
    return `${split[0]} (${split[1]})`;
  }
  return term;
}
