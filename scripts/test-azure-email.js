const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const { EmailClient } = require("@azure/communication-email");

(async () => {
  try {
    const client = new EmailClient(process.env["AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING"]);

    const emailMessage = {
      senderAddress: process.env["AZURE_COMMUNICATION_SERVICES_SENDER_ADDRESS"],
      content: {
        subject: "Hello Ayling",
        plainText: "Hello Aylin NANAZ.",
        html: `
          <html>
            <body>
              <h1>Hello Aylin NANAZ.</h1>
            </body>
          </html>`,
      },
      recipients: {
        to: [{ address: "arianf2004@gmail.com" }],
      },
    };

    const poller = await client.beginSend(emailMessage);
    const result = await poller.pollUntilDone();

    console.log(result);
  } catch (error) {
    console.error(error);
  }
})();
