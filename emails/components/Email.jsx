import React from "react";
import { Html, Section } from "@react-email/components";
import Header from "./Header";

const Email = ({ children }) => {
  return (
    <Html>
      {/* <Container> */}
      <Header />
      <Section>{children}</Section>
      {/* </Container> */}
    </Html>
  );
};

export default Email;
