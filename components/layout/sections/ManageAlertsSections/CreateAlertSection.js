import config from "@/utils/config";
import axios from "axios";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";

import classes from "./ManageAlertSection.module.scss";
import Section from "@/components/elements/Section/Section";
import Button from "@/components/elements/Button/Button";
import Form, { FormRow } from "@/components/elements/Form/Form";
import Input from "@/components/elements/Input/Input";
import { GlobalErrorContext } from "@/store/global-error-context";
import { sleep } from "@/utils/helper-client";

const CreateAlertSection = ({ course, selectedSessions }) => {
  const router = useRouter();
  const { setGlobalError } = useContext(GlobalErrorContext);

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = `/${config.API_PATH}/orders/create-checkout-session`;
      const { data: body } = await axios({
        url,
        method: "POST",
        data: {
          email,
          course: course._id,
          sections: selectedSessions,
        },
      });

      const { stripeSessionUrl } = body.data;

      router.push(stripeSessionUrl);
    } catch (axiosError) {
      const error = new Error(axiosError.response.data.message);
      setGlobalError(error);
    }

    await sleep(1000);

    setIsLoading(false);
  };

  return (
    <Section className={classes.ManageAlertSection}>
      <div className={classes.Main}>
        <div className={classes.Header}>
          <h3 className="header header-section margin-bottom-auto">Create Alert</h3>
          <p className="paragraph">Enter the details below to buy an alert for this course.</p>
        </div>
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
          <p className="paragram">Disclaimer: We do not accept refunds at this time.</p>
          <Button className={classes.FormSubmit} isLoading={isLoading}>
            Checkout
          </Button>
        </Form>
      </div>
    </Section>
  );
};

export default CreateAlertSection;
