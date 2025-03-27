const express = require("express");
const passport = require("passport");
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
    passport.authenticate("google", { failureRedirect: "/"  , successRedirect : '/auth/profile'
    }),
    (req, res) => {
      res.redirect("auth/profile");
    }
  );
router.get("/profile", (req, res) => {
  console.log(req.user);
  return res.send({
    message: "ok",
  });
});
// Logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
module.exports = router;
