import React from "react";
import businessData from "../../data/business-data";
import { Section, Text } from "@react-email/components";

const Header = () => {
  return (
    <Section>
      <Text
        style={{
          fontWeight: "bold",
          fontSize: "30px",
        }}
      >
        {businessData.name}
      </Text>
    </Section>
  );
};

export default Header;
