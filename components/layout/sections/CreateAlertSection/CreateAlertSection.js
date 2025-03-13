import classes from "./CreateAlertSection.module.scss";
import config from "@/utils/config";
import axios from "axios";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Section from "@/components/elements/Section/Section";
import Button from "@/components/elements/Button/Button";
import Form, { FormRow } from "@/components/elements/Form/Form";
import Input from "@/components/elements/Input/Input";

const CreateAlertSection = ({ course, selectedSessions }) => {
  const router = useRouter();

  const [email, setEmail] = useState("");

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
          sections: selectedSessions,
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
    <Section className={classes.Form}>
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
  );
};

export default CreateAlertSection;
