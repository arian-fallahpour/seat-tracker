const businessData = require("./business-data");

const faqData = [
  {
    question: `How do I use ${businessData.name}?`,
    answer: `First, take a look at ACORN to see if your course does not have a waitlist. If it does not, ${businessData.name} acts as a waitlist that alerts you when a spot is open. Search for your desired course, enter the email you want to get alerts from, then create the alert. ${businessData.name} will send you an alert whenever a course has open seats, only if it was previously full. Disclaimer: ${businessData.name} does not automatically enrol you into the course, you need to do that on your own.`,
  },
  // {
  //   question: `Why is ${businessData.name} paid?`,
  //   answer: `There are many factors that are calculated into the cost of running ${businessData.name}. For example, the proxy used to send the requests costs money per IP. Also, the cost of running the servers and sending emails are also considered. Overall, I try to keep the cost low, while providing the most utility as possible. I specifically use an excel formula to determine this price.`,
  // },
  {
    question: "I did not recieve my activation/notification email",
    answer:
      "Please check your spam folder too! We use a no-reply address, so you may need to add it to your trusted senders list.",
  },
  // {
  //   question: `Is it safe to use my payment method on ${businessData.name}?`,
  //   answer: `Yes, we use the widely know Stripe payments infrastucture to process our payments. This means that we have no access to your payment details, since the payment is done on Stripe's checkout website. Well-known brands such as Shopify and Amazon use it too, so rest assured that your sensitive info is safe!`,
  // },
  {
    question: "How long does my alert last?",
    answer:
      "Each alert lasts for only one term. So once the term is over, your alert will become inactive, and no longer send you alerts. If you need an alert for the same course again, you will need to create another alert.",
  },
];
module.exports = faqData;
