const { EmailClient } = require("@azure/communication-email");

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const client = new EmailClient(process.env.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING);
const senderAddress = process.env.AZURE_COMMUNICATION_SERVICES_SENDER_ADDRESS;

class AzureEmailAdapter {
  constructor({ to, subject, plainText, html }) {
    if (!Array.isArray(to)) to = [to];
    this.to = to;
    this.subject = subject;
    this.plainText = plainText;
    this.html = html;
  }

  async send() {
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
    await poller.pollUntilDone();
  }
}

module.exports = AzureEmailAdapter;
