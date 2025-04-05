const AlertNotify = require("../emails/alert-notify.jsx").default;
const AlertActivate = require("../emails/alert-activate.jsx").default;

const formData = require("form-data");
const Mailgun = require("mailgun.js");

const businessData = require("../data/business-data");
const { jsxToHtml, jsxToText } = require("./helper-server.js");

class Email {
  constructor() {
    this.from = `${businessData.name} <alerts@${process.env.MAILGUN_DOMAIN}>`;

    const mailgun = new Mailgun(formData);
    this.mailgun = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API_KEY,
    });
  }

  toEmail(email) {
    this.to = [email];
    return this;
  }

  toEmails(emails) {
    this.to = emails;
    return this;
  }

  withSubject(subject) {
    this.subject = subject;
    return this;
  }

  withTemplate(template, data) {
    if (template === "alert-notify") {
      this.withTemplateAlertNotify(data);
    } else if (template === "alert-activate") {
      this.withTemplateAlertActivate(data);
    }

    return this;
  }

  withTemplateAlertNotify(data) {
    const props = this.getProps(data);
    this.html = jsxToHtml(AlertNotify, props);
    this.text = jsxToText(AlertNotify, props);
    return this;
  }

  withTemplateAlertActivate(data) {
    const props = this.getProps(data);
    this.html = jsxToHtml(AlertActivate, props);
    this.text = jsxToText(AlertActivate, props);
    return this;
  }

  async send() {
    await this.mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
      from: this.from,
      to: this.to,
      subject: this.subject,
      text: this.text,
      html: this.html,
    });

    return this;
  }

  getProps(data) {
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    return {
      data,
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
