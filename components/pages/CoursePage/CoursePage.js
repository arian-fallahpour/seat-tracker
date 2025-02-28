"use client";

import { useState } from "react";
import Page from "@/components/elements/Page/Page";
import Section from "@/components/elements/Section/Section";
import Button from "@/components/elements/Button/Button";
import { join } from "@/utils/helper-client";
import classes from "./CoursePage.module.scss";
import config from "@/utils/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import Form, { FormRow } from "@/components/elements/Form/Form";
import CourseSections from "./CourseSections";
import Input from "@/components/elements/Input/Input";

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

        <div className={classes.CourseSections}>
          {labs.length > 0 && (
            <CourseSections
              name="labs"
              sections={labs}
              selected={selected}
              onSelectHandler={onSelectHandler}
            />
          )}
          {tutorials.length > 0 && (
            <CourseSections
              name="tutorials"
              sections={tutorials}
              selected={selected}
              onSelectHandler={onSelectHandler}
            />
          )}
        </div>

        <div className={classes.CourseForm}>
          <h3 className="header header-section margin-bottom-auto">Create Alert</h3>
          <Form className={classes.Form} onSubmit={onSubmitHandler}>
            <FormRow>
              <Input
                className={classes.FormInput}
                label="Email"
                placeholder="JohnPork@example.com"
                name="email"
                id="input-email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormRow>
            <Button className={classes.FormSubmit}>Checkout</Button>
          </Form>
        </div>
      </Section>
    </Page>
  );
};

export default CoursePage;
