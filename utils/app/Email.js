const AlertNotify = require("../../emails/alert-notify.jsx").default;
const AlertActivate = require("../../emails/alert-activate.jsx").default;

const { jsxToHtml, jsxToText } = require("../helper-server.js");
const Logger = require("../Logger.js");
const AzureEmailAdapter = require("../../utils/services/AzureEmailAdapter.js");
const businessData = require("../../data/business-data.js");
const { default: AlertVerify } = require("../../emails/alert-verify.jsx");

class Email {
  constructor({ to, subject, template, data }) {
    if (!Array.isArray(to)) to = [to];
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
    try {
      this.renderTemplate();

      await new AzureEmailAdapter({
        to: this.to,
        subject: `${businessData.name} - ${this.subject}`,
        plainText: this.text,
        html: this.html,
      }).send();

      Logger.announce(`The ${this.template} email was sent to ${this.to}`);
    } catch (error) {
      console.error("EMAIL FAILED:", error);
      Logger.warn(`The ${this.template} email was not sent to ${this.to}`, {
        email: this.to,
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

module.exports = Email;
