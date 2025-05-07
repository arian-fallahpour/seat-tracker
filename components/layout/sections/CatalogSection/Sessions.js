import classes from "./CatalogSection.module.scss";
import Session from "./Session";
import alertsData from "@/data/alerts-data.js";

const Sessions = ({ name, sessions, selectedSessions, toggleSession }) => {
  return (
    <div className={classes.Sessions}>
      <div className={classes.SessionsHeader}>
        <h3 className="header header-subsection margin-bottom-auto">{name}</h3>
        <p className="paragraph">Select the {name} you want to set up alerts for:</p>
      </div>
      <ul className={classes.SessionsList}>
        {sessions.map((section) => (
          <Session
            key={section.type + section.number}
            {...section}
            toggleSession={toggleSession}
            isSelected={selectedSessions?.includes(section.id)}
            isDisabled={
              selectedSessions?.length >= alertsData.maxSectionsPerAlert &&
              !selectedSessions?.includes(section.id)
            }
          />
        ))}
      </ul>
    </div>
  );
};

export default Sessions;
