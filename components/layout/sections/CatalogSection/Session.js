import classes from "./CatalogSection.module.scss";
import { join } from "@/utils/helper-client";

const Session = ({
  id,
  type,
  number,
  campus,
  lastUpdatedAt,
  isSelected,
  toggleSession,
  isDisabled,
}) => {
  const lastUpdatedDate = new Date(lastUpdatedAt);

  return (
    <li className={join(classes.Session, isSelected ? classes.selected : null)}>
      <button
        className={classes.SessionMain}
        aria-selected={isSelected}
        disabled={isDisabled}
        onClick={() => toggleSession(id)}
      >
        <span className={classes.SessionCheck}>
          <span className={classes.SessionCheckInner} />
        </span>
        <div className={classes.SessionContent}>
          <div className={classes.SessionCampus}>{campus}</div>
          <div className={join("header", "header-card", classes.SessionHeader)}>
            <div>{type}</div>
            <div>{number}</div>
          </div>
          <div className={classes.SessionDate}>
            Updated at {lastUpdatedDate.toLocaleDateString("en-US")},{" "}
            {lastUpdatedDate.toLocaleTimeString("en-US")}
          </div>
        </div>
      </button>
    </li>
  );
};

export default Session;
