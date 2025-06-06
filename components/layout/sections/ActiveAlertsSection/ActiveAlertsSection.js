import { createServerURL } from "@/utils/helper-server";
import Section from "@/components/elements/Section/Section";
import config from "@/utils/config";
import classes from "./ActiveAlertsSection.module.scss";

import Button from "@/components/elements/Button/Button";
import { join } from "@/utils/helper-client";
import businessData from "../../../../data/business-data";

const getData = async () => {
  const url = await createServerURL(`/${config.API_PATH}/alerts/count`);
  const response = await fetch({ url, method: "GET" }, { next: { revalidate: 3600 } });

  if (!response.ok) {
    throw new Error("Could not get course data.");
  }

  const body = await response.json();
  const { count } = body.data;
  return count;
};

const ActiveAlertsSection = async () => {
  const activeAlerts = await getData();

  return (
    <Section className={classes.ActiveAlertsSection}>
      <p className={join("paragraph", classes.Copyright)}>
        © {new Date(Date.now()).getFullYear()} {businessData.name}.
      </p>

      <Button variant="text" className={classes.FAQ} href="/faq" isLink>
        FAQ
      </Button>

      <div className={classes.ActiveAlerts}>
        <div className={classes.ActiveAlertsIndicator}>
          <span className={classes.ActiveAlertsIndicatorInner} />
          <span className={classes.ActiveAlertsIndicatorOuter} />
        </div>
        <span className={classes.ActiveAlertsCount}>Active Alerts: {activeAlerts}</span>
      </div>
    </Section>
  );
};

export default ActiveAlertsSection;
