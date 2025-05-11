import React from "react";
import { Section, Text } from "@react-email/components";
import Email from "./components/Email";
import Footer from "./components/Footer";

const dummyData = {
  course: {
    id: "67ac0ad78500d508d978b77b",
    code: "CHE204H1 F",
    name: "Chem Eng & Applied Chem I",
    term: {
      year: 2024,
      season: "fall",
      _id: "67ef5115cf42079b0f086d36",
    },
    slug: "che204h1-f",
  },
  alert: {
    id: "67ba7fe2456310e908429fe4",
    email: "arianf2004@gmail.com",
    school: "uoft",
    status: "active",
  },
};

const dummyContext = {
  protocol: "http",
  host: "localhost",
  port: "3000",
  baseURL: "http://localhost:3000",
};

// TODO: Fix
export default function AlertVerify({ data = dummyData, context = dummyContext }) {
  const { code } = data;
  const { baseURL } = context;

  return (
    <Email>
      <Text>Hey there!</Text>
      <Text>Go to this link: </Text>
      <Text>https://coursetracker.ca/verify-alert/?code={code}</Text>

      <Footer context={context} />
    </Email>
  );
}
