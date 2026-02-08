import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { EmailClient } from "@azure/communication-email";
import AzureEmailAdapter from "@/utils/services/AzureEmailAdapter";

(async () => {
  try {
    const email = new AzureEmailAdapter({
      to: "arianf2004@gmail.com",
      subject: "Hello Ayling",
      plainText: "Hello Aylin NANAZ.",
      html: `
        <html>
          <body>
            <h1>Hello Aylin NANAZ.</h1>
          </body>
        </html>`,
    });

    await email.send();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
