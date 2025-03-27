const express = require("express");
const passport = require("passport");
const { AppDataSource } = require("../config/db");
const { getProfileDetails } = require("../controllors/auth.controller.js");
const User = require("../entities/User");
const router = express.Router();




module.exports = router;
