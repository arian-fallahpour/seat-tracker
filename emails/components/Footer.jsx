import businessData from "@/data/business-data";
import { Button, Column, Row, Section, Text } from "@react-email/components";
import React from "react";

const Footer = () => {
  return (
    <Section>
      <Row>
        <FooterLink href="https://example.com/">Home</FooterLink>
        <FooterLink href="https://example.com/">Edit Alert</FooterLink>
      </Row>
    </Section>
  );
};

const FooterLink = ({ href, children }) => (
  <Button
    href={href}
    style={{
      marginRight: "30px",
    }}
  >
    {children}
  </Button>
);

export default Footer;
