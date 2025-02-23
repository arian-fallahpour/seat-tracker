import React from "react";
import classes from "./CoursePage.module.scss";
import { join } from "@/utils/helper-client";

const CourseSection = ({
  id,
  type,
  number,
  campus,
  lastUpdatedAt,
  isSelected,
  onSelectHandler,
}) => {
  const lastUpdatedDate = new Date(lastUpdatedAt);

  return (
    <li
      className={join(classes.Section, isSelected ? classes.selected : null)}
      onClick={() => onSelectHandler(id)}
    >
      <button className={classes.SectionMain} aria-selected={isSelected}>
        <div className={classes.SectionCheck} />
        <div className={classes.SectionContent}>
          <div className={classes.SectionCampus}>{campus}</div>
          <div className={join("header", "header-card", classes.SectionHeader)}>
            <div>{type}</div>
            <div>{number}</div>
          </div>
          <div className={classes.SectionDate}>
            Updated at {lastUpdatedDate.toLocaleDateString("en-US")},{" "}
            {lastUpdatedDate.toLocaleTimeString("en-US")}
          </div>
        </div>
      </button>
    </li>
  );
};

export default CourseSection;
