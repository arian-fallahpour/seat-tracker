const businessData = require("../data/business-data");
const formData = require("form-data");
const Mailgun = require("mailgun.js");

// TODO: Setup for production
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
    this.text = data.text;
    this.html = data.html;
    return this;
  }

  // TODO: Fix this
  withTemplateAlertActivate(data) {
    this.text = data.text;
    this.html = data.html;
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
