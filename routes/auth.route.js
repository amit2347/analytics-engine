const express = require("express");
const passport = require("passport");
const {
  getProfileDetails,
  registerApplication,
  regenerateApiKey,
  revokeApiKey
} = require("../controllors/auth.controller.js");
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
router.post("/register", registerApplication);
router.get('/api-key' , regenerateApiKey )
router.post('/revoke' , revokeApiKey )
// Logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
module.exports = router;
