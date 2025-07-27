const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configure the email transport using a service like Gmail
// NOTE: You must generate a Google App Password for this to work.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.email, // your gmail address
    pass: functions.config().gmail.password, // your app password
  },
});

// This is the Cloud Function that will be triggered
exports.onOrderAccepted = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    // Get the data from the document change
    const orderDataAfter = change.after.data();
    const orderDataBefore = change.before.data();

    // Check if the status was changed from something else to "accepted"
    if (
      orderDataBefore.status !== "accepted" &&
      orderDataAfter.status === "accepted"
    ) {
      const userEmail = orderDataAfter.userEmail;
      const userName = orderDataAfter.userName;

      const mailOptions = {
        from: "MGoMom <your.email@gmail.com>", // Use your email
        to: userEmail,
        subject: "Your MGoMom Order has been Accepted!",
        html: `
          <p>Hi ${userName},</p>
          <p>This is a confirmation that your recent MGoMom order for the service "${orderDataAfter.service}" has been accepted and is now in progress.</p>
          <p>We'll be in touch soon!</p>
          <p>Best,</p>
          <p>The MGoMom Team</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Acceptance email sent successfully to:", userEmail);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    }
    return null; // Function must return a value or a promise
  });