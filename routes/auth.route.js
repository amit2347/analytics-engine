const express = require("express");
const passport = require("passport");
const {
  verifyTempToken,
} = require("../middlewares/verifyTempToken.middleware.js");
const {
  getProfileDetails,
  registerApplication,
  getApiKey,
  revokeApiKey,
} = require("../controllors/auth.controller.js");
const {
  validateRequest,
} = require("../middlewares/schemaValidation.middlewares");
const {
  registerAppSchema,
  getApiKeySchema,
  revokeApiKeySchema,
} = require("../validators/auth.validation.js");
const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback after successful login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    successRedirect: "/auth/profile",
  }),
  (req, res) => {
    res.redirect("auth/profile");
  }
);
router.get("/profile", getProfileDetails);
//endpoint for register app for analytics
router.post(
  "/register",
  validateRequest(registerAppSchema),
  verifyTempToken,
  registerApplication
);
router.get(
  "/api-key",
  validateRequest(getApiKeySchema),
  verifyTempToken,
  getApiKey
);
router.post(
  "/revoke",
  validateRequest(revokeApiKeySchema),
  verifyTempToken,
  revokeApiKey
);
// Logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
module.exports = router;
