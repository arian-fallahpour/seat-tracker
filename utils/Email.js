const Mailgun = require("mailgun.js");
// const React = require("react");
// const { render } = require("@react-email/render");

const businessData = require("../data/business-data.js");
const formData = require("form-data");
// const AlertNotify = require("../emails/alert-notify.jsx").default;

// TODO: Implement full functionality with react-email, and add useful information to each email
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

  // TODO: Fix this
  withTemplateAlertNotify(data) {
    // console.log(AlertNotify.default);
    // const emailElement = React.createElement(AlertNotify, { ...data }, null);
    // this.html = await render(emailElement, { pretty: true });
    // this.text = await render(emailElement, { plainText: true });
    this.html = "test";
    this.text = "test";
    return this;
  }

  // TODO: Fix this
  withTemplateAlertActivate(data) {
    this.html = data.html;
    this.text = data.text;
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
}

module.exports = Email;
