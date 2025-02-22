"use client";

import { useState } from "react";
import Page from "@/components/elements/Page/Page";
import CourseSection from "./CourseSection";
import Section from "@/components/elements/Section/Section";
import Button from "@/components/elements/Button/Button";
import { join } from "@/utils/helper-client";
import classes from "./CoursePage.module.scss";

const CoursePage = ({ course }) => {
  const [selected, setSelected] = useState([]);

  const labs = course.sections.filter((section) => section.type === "lab");
  const tutorials = course.sections.filter((section) => section.type === "tutorial");

  const onClickHandler = (id) => {
    if (selected.includes(id)) {
      setSelected((prev) => prev.filter((s) => s !== id));
    } else {
      setSelected((prev) => [...prev, id]);
    }
  };

  return (
    <Page includeBackButton>
      <Section className={classes.Course}>
        <div className={classes.CourseHeader}>
          <div className={classes.CourseTerm}>
            {course.term.season} {course.term.year}
          </div>
          <h1 className={join("header", "header-title")}>{course.code}</h1>
          <h2 className="subtitle">{course.name}</h2>
        </div>
        <div className={classes.CourseContent}>
          {labs.length > 0 && (
            <div className={classes.Sections}>
              <div className={classes.SectionsHeader}>
                <h3 className="header header-subsection">Labs</h3>
                <p className="paragraph">Select the labs you want to be alerted for</p>
              </div>
              <ul className={classes.SectionsList}>
                {labs.map((section, i) => (
                  <CourseSection
                    key={section.type + section.number}
                    {...section}
                    isSelected={selected.includes(section.id)}
                    onClickHandler={onClickHandler}
                  />
                ))}
              </ul>
            </div>
          )}
          {tutorials.length > 0 && (
            <div className={classes.Sections}>
              <div className={classes.SectionsHeader}>
                <h3 className="header header-subsection">Tutorials</h3>
                <p className="paragraph">Select the sections you want to be alerted for</p>
              </div>
              <ul className={classes.SectionsList}>
                {tutorials.map((section, i) => (
                  <CourseSection
                    key={section.type + section.number}
                    {...section}
                    isSelected={selected.includes(section.id)}
                    onClickHandler={onClickHandler}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className={classes.CourseFooter}>
          <Button>Create Alert</Button>
        </div>
      </Section>
    </Page>
  );
};

export default CoursePage;
