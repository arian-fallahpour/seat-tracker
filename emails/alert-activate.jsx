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

export default function AlertActivate({ data, context }) {
  const { course, alert } = data || dummyData;
  const { baseURL } = context || dummyContext;

  const editAlertLink = `${baseURL}/edit-alert/${alert.id}`;

  return (
    <Email alert={alert}>
      <Text>Hey there!</Text>
      <Text>New seat alert activation for {alert.email}!</Text>
      <Section style={{ marginTop: 16, marginBottom: 16 }}>
        <Text style={{ padding: 0, margin: 0 }}>
          The following section{alert.sections.length > 1 ? "s" : ""} have active alerts in{" "}
          {course.name} ({course.code}):
        </Text>
        {alert.sections.map((section, i) => (
          <Text style={{ padding: 0, margin: 0 }} key={section.type + section.number}>
            {section.type} {section.number}
          </Text>
        ))}
      </Section>
      <Footer editAlertLink={editAlertLink} />
    </Email>
  );
}
