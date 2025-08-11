const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fs = require("fs"); // File System module to read the HTML file

admin.initializeApp();

// --- This is your new, secure function for the admin page ---
exports.adminPage = functions.https.onRequest(async (req, res) => {
    // IMPORTANT: Replace with your mom's actual User ID
    const ADMIN_UID = "REPLACE_WITH_YOUR_MOMS_USER_ID";

    const sessionCookie = req.cookies.session || "";

    try {
        // Verify the user is logged in
        const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
        
        // Check if the logged-in user is the admin
        if (decodedClaims.uid === ADMIN_UID) {
            // If they are the admin, read and serve the admin.html file
            const adminHtml = fs.readFileSync("./admin.html").toString();
            res.status(200).send(adminHtml);
        } else {
            // If they are a regular user, redirect to the homepage
            res.redirect("/");
        }
    } catch (error) {
        // If they are not logged in, or the cookie is invalid, redirect to the homepage
        res.redirect("/");
    }
});


// --- This is your existing function for sending booking emails ---
// Make sure to set up Brevo as we discussed
const brevo = require("@getbrevo/brevo");
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.authentications["apiKey"].apiKey = functions.config().brevo.key;

exports.sendBookingEmail = functions.firestore
    .document('bookings/{bookingId}')
    .onCreate(async (snap, context) => {
        // Your Brevo email sending logic goes here...
    });