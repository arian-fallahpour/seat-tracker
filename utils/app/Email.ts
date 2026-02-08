import AlertNotify from "../../emails/alert-notify.jsx";
import AlertActivate from "../../emails/alert-activate.jsx";

import { jsxToHtml, jsxToText } from "../helper-server.js";
import Logger from "../Logger.js";
import AzureEmailAdapter from "../services/AzureEmailAdapter.js";
import businessData from "../../data/business-data.js";
import AlertVerify from "../../emails/alert-verify.jsx";

type EmailParamsType = {
  to: string;
  subject: string;
  template: "alert-notify" | "alert-activate" | "alert-verify";
  data: any;
};

class Email {
  to: string;
  subject: EmailParamsType["subject"];
  template: EmailParamsType["template"];
  data: EmailParamsType["data"];
  html: string;
  text: string;

  constructor({ to, subject, template, data }: EmailParamsType) {
    this.to = to;
    this.subject = subject;
    this.template = template;
    this.data = data;
  }

  renderTemplate() {
    if (this.template === "alert-notify") {
      this.renderTemplateAlertNotify();
    } else if (this.template === "alert-activate") {
      this.renderTemplateAlertActivate();
    } else if (this.template === "alert-verify") {
      this.renderTemplateAlertVerify();
    }
  }

  renderTemplateAlertNotify() {
    const props = this.getProps();
    this.html = jsxToHtml(AlertNotify, props);
    this.text = jsxToText(AlertNotify, props);
  }

  renderTemplateAlertActivate() {
    const props = this.getProps();
    this.html = jsxToHtml(AlertActivate, props);
    this.text = jsxToText(AlertActivate, props);
  }

  renderTemplateAlertVerify() {
    const props = this.getProps();
    this.html = jsxToHtml(AlertVerify, props);
    this.text = jsxToText(AlertVerify, props);
  }

  /**
   * Sends email using details in current email object
   */
  async send() {
    if (process.env.DO_NOT_SEND_EMAILS) return;

    try {
      this.renderTemplate();

      await new AzureEmailAdapter({
        to: this.to,
        subject: `${businessData.name} - ${this.subject}`,
        plainText: this.text,
        html: this.html,
      }).send();

      Logger.info(`The ${this.template} email was sent to ${this.to}`);
    } catch (error) {
      Logger.warn(`Email Send Error: ${error.message}`, {
        to: this.to,
        template: this.template,
        error,
      });
    }
  }

  getProps() {
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseURL =
      process.env.NODE_ENV === "development"
        ? `${protocol}://${process.env.HOST}:${process.env.PORT}`
        : `${protocol}://${process.env.HOST}`;

    return {
      data: this.data,
      context: {
        host: process.env.HOST,
        port: process.env.PORT,
        protocol: protocol,
        baseURL,
      },
    };
  }
}

export default Email;
