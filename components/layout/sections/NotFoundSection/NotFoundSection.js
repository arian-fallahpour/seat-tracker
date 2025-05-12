import React from "react";
import Section from "@/components/elements/Section/Section";
import classes from "./NotFoundSection.module.scss";

const NotFoundSection = () => {
  return (
    <Section className={classes.NotFoundSection}>
      <div className="header header-title margin-bottom-auto">404 - Page Not Found</div>
      <p className="paragraph margin-bottom-auto">The page you are looking for does not exist.</p>
      <p className="paragraph margin-bottom-auto">
        Please check the URL or return to the homepage.
      </p>
    </Section>
  );
};

export default NotFoundSection;
