const express = require("express");
const passport = require("passport");
const {
    collectLogs,
    getEventSummary
  } = require("../controllors/analytics.controller");
const router = express.Router();

router.post("/collect", collectLogs);
router.get("/event-summary" , getEventSummary)

module.exports = router;
