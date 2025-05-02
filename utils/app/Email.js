const AlertNotify = require("../../emails/alert-notify.jsx").default;
const AlertActivate = require("../../emails/alert-activate.jsx").default;

const formData = require("form-data");
const Mailgun = require("mailgun.js");

const businessData = require("../../data/business-data.js");
const { jsxToHtml, jsxToText } = require("../helper-server.js");
const Logger = require("../Logger.js");

const mailgunClient = new Mailgun(formData).client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});
class Email {
  constructor({ to, subject, template, data }) {
    if (!Array.isArray(to)) to = [to];
    this.from = `${businessData.name} <alerts@${process.env.MAILGUN_DOMAIN}>`;
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

  /**
   * Sends email using details in current email object
   */
  async send() {
    try {
      this.renderTemplate();

      await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, {
        from: this.from,
        to: this.to,
        subject: this.subject,
        text: this.text,
        html: this.html,
      });
      Logger.announce(`The ${this.template} email was sent to ${this.to}`);
    } catch (error) {
      Logger.warn(`The ${this.template} email was not sent to ${this.to}`, {
        email: this.to,
        error,
      });
    }

    return this;
  }

  getProps() {
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    return {
      data: this.data,
      context: {
        host: process.env.HOST,
        port: process.env.PORT,
        protocol: protocol,
        baseURL: `${protocol}://${process.env.HOST}:${process.env.PORT}`,
      },
    };
  }
}

module.exports = Email;
