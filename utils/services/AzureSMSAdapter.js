class AzureSMSAdapter {
  constructor({ to, message }) {
    if (!Array.isArray(to)) to = [to];
    this.to = to;
    this.message = message;
  }

  async send() {}
}
