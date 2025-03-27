const express = require("express");
const passport = require("passport");
const { AppDataSource } = require("../config/db");
const { getProfileDetails } = require("../controllors/auth.controller.js");
const User = require("../entities/User");
const router = express.Router();

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

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
// Logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
module.exports = router;
