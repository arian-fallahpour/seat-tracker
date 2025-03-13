import classes from "./CatalogSection.module.scss";
import Session from "./Session";

const Sessions = ({ name, sessions, selectedSessions, toggleSession }) => {
  return (
    <div className={classes.Sessions}>
      <div className={classes.SessionsHeader}>
        <h3 className="header header-subsection margin-bottom-auto">{name}</h3>
        <p className="paragraph">Select the {name} you want to be alerted for</p>
      </div>
      <ul className={classes.SessionsList}>
        {sessions.map((section) => (
          <Session
            key={section.type + section.number}
            {...section}
            isSelected={selectedSessions?.includes(section.id)}
            toggleSession={toggleSession}
          />
        ))}
      </ul>
    </div>
  );
};

export default Sessions;
