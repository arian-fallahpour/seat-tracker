import { Html, Section } from "@react-email/components";
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Email = ({ children }) => {
  return (
    <Html>
      {/* <Container> */}
      <Header />
      <Section>{children}</Section>
      <Footer />
      {/* </Container> */}
    </Html>
  );
};

export default Email;
