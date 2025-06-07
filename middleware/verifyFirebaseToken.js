const admin = require("firebase-admin");

module.exports = async function verifyFirebaseToken(req, res, next) {
  const rawHeader = req.headers.authorization || "";
  console.log("🪪 Raw auth header:", rawHeader);

  const token = rawHeader.startsWith("Bearer ")
    ? rawHeader.slice(7)
    : null;

  if (!token) {
    console.warn("❌ No token in Authorization header");
    return res.status(401).json({ error: "Missing or invalid token format" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("✅ Firebase token verified:", decoded.uid);
    req.firebaseUser = decoded;
    next();
  } catch (err) {
    console.error("❌ Firebase token verification failed:", err.message);
    return res.status(401).json({ error: "Token verification failed" });
  }
};
