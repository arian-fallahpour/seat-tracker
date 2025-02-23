"use client";

import { useState } from "react";
import Page from "@/components/elements/Page/Page";
import CourseSection from "./CourseSection";
import Section from "@/components/elements/Section/Section";
import Button from "@/components/elements/Button/Button";
import { join } from "@/utils/helper-client";
import classes from "./CoursePage.module.scss";
import config from "@/utils/config";
import axios from "axios";
import { useRouter } from "next/navigation";

const CoursePage = ({ course }) => {
  const router = useRouter();

  const [selected, setSelected] = useState([]);
  const [email, setEmail] = useState("");

  const labs = course.sections.filter((section) => section.type === "lab");
  const tutorials = course.sections.filter((section) => section.type === "tutorial");

  const onSelectHandler = (id) => {
    if (selected.includes(id)) {
      setSelected((prev) => prev.filter((s) => s !== id));
    } else {
      setSelected((prev) => [...prev, id]);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const url = `/${config.API_PATH}/orders/create-checkout-session`;
      const response = await axios({
        url,
        method: "POST",
        data: {
          email,
          course: course._id,
          sections: selected,
          school: "uoft",
        },
      });
      const { stripeSessionUrl } = response.data.data;

      router.push(stripeSessionUrl);
    } catch (err) {
      console.error(err);
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
                {labs.map((section) => (
                  <CourseSection
                    key={section.type + section.number}
                    {...section}
                    isSelected={selected.includes(section.id)}
                    onSelectHandler={onSelectHandler}
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
                    onSelectHandler={onSelectHandler}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
        <form className={classes.CourseForm} onSubmit={onSubmitHandler}>
          {/* <Input label="Enter Email" placeholder="email@example.com" /> */}
          <input label="email" onChange={(e) => setEmail(e.target.value)} />
          <Button>Create Alert</Button>
        </form>
      </Section>
    </Page>
  );
};

export default CoursePage;
