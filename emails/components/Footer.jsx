import React from "react";
import { Button, Row, Section, Text } from "@react-email/components";

const Footer = ({ editAlertLink }) => {
  return (
    <Section>
      <Row>
        <FooterLink href="https://example.com/">Home</FooterLink>
        {editAlertLink && <FooterLink href={editAlertLink}>Edit Alert</FooterLink>}
      </Row>
    </Section>
  );
};

const FooterLink = ({ href, children }) => (
  <Text style={{ display: "inline-block", marginTop: "0px", marginBottom: "0px" }}>
    <Button
      href={href}
      style={{
        marginRight: "30px",
      }}
    >
      {children}
    </Button>
  </Text>
);

export default Footer;
