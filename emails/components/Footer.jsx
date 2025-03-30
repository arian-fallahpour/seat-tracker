import React from "react";
import { Button, Row, Section } from "@react-email/components";

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
