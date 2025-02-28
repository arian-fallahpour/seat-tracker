import React from "react";
import classes from "./CoursePage.module.scss";
import CourseSection from "./CourseSection";

const CourseSections = ({ name, sections, selected, onSelectHandler }) => {
  return (
    <div className={classes.Sections}>
      <div className={classes.SectionsHeader}>
        <h3 className="header header-subsection margin-bottom-auto">{name}</h3>
        <p className="paragraph">Select the {name} you want to be alerted for</p>
      </div>
      <ul className={classes.SectionsList}>
        {sections.map((section) => (
          <CourseSection
            key={section.type + section.number}
            {...section}
            isSelected={selected && selected.includes(section.id)}
            onSelectHandler={onSelectHandler}
          />
        ))}
      </ul>
    </div>
  );
};

export default CourseSections;
