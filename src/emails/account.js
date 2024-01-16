const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "abhi.t@crestinfosystems.com",
    subject: "Thanks for joining in !",
    text: `Welcome to the app, ${name}`,
  });
};

const sendCancellationMail = (email, name) => {
  sgMail.send({
    to: email,
    from: "abhi.t@crestinfosystems.com",
    subject: "Cancellation mail",
    text: `hello, ${name}. To check for cancellation.`,
  });
};

module.exports = { sendWelcomeEmail, sendCancellationMail };
