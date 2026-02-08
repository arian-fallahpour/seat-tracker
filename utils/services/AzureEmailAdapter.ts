import { EmailClient } from "@azure/communication-email";

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const client = new EmailClient(process.env.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING);
const senderAddress = process.env.AZURE_COMMUNICATION_SERVICES_SENDER_ADDRESS;

type AzureEmailAdapterParams = {
  to: string | string[];
  subject: string;
  plainText: string;
  html: string;
  shouldPoll?: boolean;
};

class AzureEmailAdapter {
  to: string[];
  subject: string;
  plainText: string;
  html: string;
  shouldPoll: boolean;

  constructor({ to, subject, plainText, html, shouldPoll = false }: AzureEmailAdapterParams) {
    this.to = !Array.isArray(to) ? [to] : to;
    this.subject = subject;
    this.plainText = plainText;
    this.html = html;
    this.shouldPoll = shouldPoll;
  }

  async send(): Promise<void> {
    const emailMessage = {
      senderAddress,
      content: {
        subject: this.subject,
        plainText: this.plainText,
        html: this.html,
      },
      recipients: {
        to: this.to.map((address) => ({ address })),
      },
    };

    const poller = await client.beginSend(emailMessage);

    if (this.shouldPoll) {
      await poller.pollUntilDone();
    }
  }
}

export default AzureEmailAdapter;
