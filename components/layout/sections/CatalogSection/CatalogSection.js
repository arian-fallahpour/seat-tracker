import classes from "./CatalogSection.module.scss";
import { join } from "@/utils/helper-client";
import Section from "@/components/elements/Section/Section";
import Sessions from "./Sessions";

const CatalogSection = ({ course, selectedSessions, toggleSession }) => {
  const labs = course.sections.filter((section) => section.type === "lab");
  const tutorials = course.sections.filter((section) => section.type === "tutorial");

  return (
    <Section className={classes.CatalogSection}>
      <div className={classes.Header}>
        <div className={classes.HeaderTerm}>
          {course.term.season} {course.term.year}
        </div>
        <h1 className={join("header", "header-title")}>{course.code}</h1>
        <h2 className="subtitle">{course.name}</h2>
      </div>
      <div className={classes.Main}>
        {labs.length > 0 && (
          <Sessions
            name="labs"
            sessions={labs}
            selectedSessions={selectedSessions}
            toggleSession={toggleSession}
          />
        )}
        {tutorials.length > 0 && (
          <Sessions
            name="tutorials"
            sessions={tutorials}
            selectedSessions={selectedSessions}
            toggleSession={toggleSession}
          />
        )}
      </div>
    </Section>
  );
};

export default CatalogSection;
