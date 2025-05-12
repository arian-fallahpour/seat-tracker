import React from "react";
import { Button, Section, Text } from "@react-email/components";
import Email from "./components/Email";
import Footer from "./components/Footer";

const dummyData = {
  code: "cd4075fed22a158a1afa07d6be581d1a0389cb8935ebccc9c3ad278bf51665ad",
  alert: {
    id: "67ba7fe2456310e908429fe4",
    email: "arianf2004@gmail.com",
    school: "uoft",
    status: "active",
  },
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
};

const dummyContext = {
  protocol: "http",
  host: "localhost",
  port: "3000",
  baseURL: "http://localhost:3000",
};

// TODO: Fix
export default function AlertVerify({ data = dummyData, context = dummyContext }) {
  const { code, alert, course } = data;
  const { baseURL } = context;

  const verificationLink = `${baseURL}/verify-alert/?code=${code}`;

  return (
    <Email>
      <Text>Hey there!</Text>
      <Text>Click/copy the link below to verify and activate your alert for {course.code}:</Text>
      <Button href={verificationLink}>{verificationLink}</Button>

      <Text>Once verified, you will get another email confirming your alert's activation!</Text>

      <Footer context={context} />
    </Email>
  );
}
