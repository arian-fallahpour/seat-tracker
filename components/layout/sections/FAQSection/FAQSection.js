import React from "react";
import Section from "@/components/elements/Section/Section";
import faqData from "../../../../data/faq-data";
import classes from "./FAQSection.module.scss";

const FAQSection = () => {
  return (
    <Section className={classes.FAQSection}>
      <h1 className="header header-title">FAQ</h1>
      <ul className={classes.Questions}>
        {faqData.map((faq) => (
          <li className={classes.Question} key={faq.question}>
            <h2 className="header header-section">{faq.question}</h2>
            <p className="paragraph">{faq.answer}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
};

export default FAQSection;
