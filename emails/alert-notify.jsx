import { Row, Text } from "@react-email/components";
import Email from "./components/Email";

export default function AlertNotify({ alert }) {
  return (
    <Email>
      <Row>
        <Text>Here are the sections you will get alerted for:</Text>
      </Row>
      {alert?.sections?.map((section) => (
        <Row>
          <Text>{section}</Text>
        </Row>
      )) || <Text>No sections!</Text>}
    </Email>
  );
}
