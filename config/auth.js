const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { getRepository } = require("typeorm");
const User = require("../entities/User");

