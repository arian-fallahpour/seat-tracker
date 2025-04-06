"use client";

import classes from "./EditAlertSection.module.scss";
import config from "@/utils/config";
import axios from "axios";

import Section from "@/components/elements/Section/Section";
import Button from "@/components/elements/Button/Button";
import Form, { FormRow } from "@/components/elements/Form/Form";
import Input from "@/components/elements/Input/Input";
import { useState } from "react";
import Checkbox from "@/components/elements/Checkbox/Checkbox";

const EditAlertSection = ({ alert, selectedSessions }) => {
  const [email, setEmail] = useState(alert.email);
  const [paused, setPaused] = useState(alert.status === "paused");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const url = `/${config.API_PATH}/alerts/info/${alert._id}`;
      const { data } = await axios({
        url,
        method: "POST",
        data: {
          email: email,
          status: paused ? "paused" : "active",
          sections: selectedSessions,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  // TODO: Responsive styles
  return (
    <Section className={classes.EditAlertSection}>
      <div className={classes.Main}>
        <div className={classes.Header}>
          <h3 className="header header-section margin-bottom-auto">Update Alert</h3>
          <p className="paragraph margin-bottom-auto">
            If you lose access to your old/new email, simply use any link previously sent to you for
            this alert.
          </p>
        </div>
        <Form className={classes.Form} onSubmit={onSubmitHandler}>
          <FormRow>
            <Input
              className={classes.FormInput}
              value={email}
              label="email"
              placeholder="JohnPork@example.com"
              name="email"
              id="input-email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormRow>
          <FormRow>
            <Checkbox
              className={classes.FormInput}
              label="Pause notifications"
              placeholder="active"
              name="status"
              id="input-status"
              value={paused}
              onChange={(e) => setPaused(e.target.checked)}
            />
          </FormRow>
          <Button className={classes.FormSubmit}>Update alert</Button>
        </Form>
      </div>
    </Section>
  );
};

export default EditAlertSection;
