// auth/garmin/initiate.js
const express = require("express");
const router = express.Router();
const OAuth = require("oauth").OAuth;

const GARMIN_REQUEST_URL = "https://connectapi.garmin.com/oauth-service/oauth/request_token";
const GARMIN_ACCESS_URL = "https://connectapi.garmin.com/oauth-service/oauth/access_token";
const GARMIN_AUTHORIZE_URL = "https://connect.garmin.com/oauthConfirm";

const oa = new OAuth(
  GARMIN_REQUEST_URL,
  GARMIN_ACCESS_URL,
  process.env.GARMIN_CONSUMER_KEY,
  process.env.GARMIN_CONSUMER_SECRET,
  "1.0",
  process.env.GARMIN_CALLBACK_URL,
  "HMAC-SHA1"
);

// In-memory temp token store (for dev only; use DB in prod)
const oauthTokenSecrets = {};

router.get("/", (req, res) => {
  oa.getOAuthRequestToken((err, token, tokenSecret) => {
    if (err) {
      console.error("❌ Error getting request token:", err);
      return res.status(500).json({ error: "Failed to get Garmin request token" });
    }

    // Save temp secret in session or in-memory store
    oauthTokenSecrets[token] = tokenSecret;

    // Store in session or local user cache if needed
    req.app.locals.oauthTokenSecrets = oauthTokenSecrets;

    console.log("🔐 OAuth token:", token);
    console.log("🔐 OAuth secret:", tokenSecret);

    // Redirect to Garmin's OAuth screen
    res.redirect(`${GARMIN_AUTHORIZE_URL}?oauth_token=${token}`);
  });
});

module.exports = router;
