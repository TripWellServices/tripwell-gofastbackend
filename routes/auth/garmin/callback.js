const express = require("express");
const router = express.Router();
const OAuth = require("oauth").OAuth;

// Same setup as initiate.js — use shared service in future
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

router.get("/", (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;

  // Grab the secret from shared in-memory store
  const oauthTokenSecrets = req.app.locals.oauthTokenSecrets || {};
  const tokenSecret = oauthTokenSecrets[oauth_token];

  if (!tokenSecret) {
    return res.status(400).json({ error: "Missing or expired token secret" });
  }

  // Exchange for access token + secret
  oa.getOAuthAccessToken(
    oauth_token,
    tokenSecret,
    oauth_verifier,
    async (err, accessToken, accessTokenSecret, results) => {
      if (err) {
        console.error("❌ Error exchanging access token:", err);
        return res.status(500).json({ error: "OAuth access token exchange failed" });
      }

      // At this point, accessToken + accessTokenSecret are PERMANENT for the user
      console.log("✅ Garmin Access Token:", accessToken);
      console.log("✅ Garmin Access Secret:", accessTokenSecret);

      // TODO: store to DB (example placeholder)
      // await User.updateOne({ _id: userId }, {
      //   garminAccessToken: accessToken,
      //   garminAccessSecret: accessTokenSecret
      // });

      // Clean up secret if needed
      delete oauthTokenSecrets[oauth_token];

      // Redirect back to frontend
      res.redirect("/auth-success"); // or wherever your app goes post-auth
    }
  );
});

module.exports = router;
