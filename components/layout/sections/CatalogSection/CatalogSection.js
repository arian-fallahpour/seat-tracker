import classes from "./CatalogSection.module.scss";
import { join } from "@/utils/helper-client";
import Section from "@/components/elements/Section/Section";
import Sessions from "./Sessions";
import { useMemo } from "react";

const CatalogSection = ({ course, selectedSessions, toggleSession }) => {
  const sessions = useMemo(() => {
    const sessions = {};

    for (const section of course.sections) {
      if (!sessions[section.type]) {
        sessions[section.type] = [];
      }

      sessions[section.type].push(section);
    }

    return sessions;
  }, [course]);

  return (
    <Section className={classes.CatalogSection}>
      <div className={classes.Header}>
        <div className={classes.HeaderTerm}>
          {course.term.name} {course.term.year}
        </div>
        <h1 className={join("header", "header-title")}>{course.code}</h1>
        <h2 className="subtitle">{course.name}</h2>
      </div>
      <div className={classes.Main}>
        {Object.keys(sessions).map(
          (key) =>
            sessions[key].length > 0 && (
              <Sessions
                key={key}
                name={key + "s"}
                sessions={sessions[key]}
                selectedSessions={selectedSessions}
                toggleSession={toggleSession}
              />
            )
        )}
      </div>
    </Section>
  );
};

export default CatalogSection;
