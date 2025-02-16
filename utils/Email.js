const formData = require("form-data");
const Mailgun = require("mailgun.js");

class Email {
  constructor() {
    const mailgun = new Mailgun(formData);
    this.mailgun = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API_KEY,
    });
  }
}

module.exports = Email;
