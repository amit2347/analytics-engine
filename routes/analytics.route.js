const express = require("express");
const passport = require("passport");
const {
    collectLogs,
    getEventSummary,
    getUserStats
  } = require("../controllors/analytics.controller");
const router = express.Router();

router.post("/collect", collectLogs);
router.get("/event-summary" , getEventSummary)
router.get('/user-stats' , getUserStats)

module.exports = router;
