const express = require("express");
const {
  verifyUserToken,
} = require("../middlewares/verifyUserToken.middleware");
const {
  validateRequest,
} = require("../middlewares/schemaValidation.middlewares");
const { collectLogsSchema } = require("../validators/analytics.validation");
const {
  collectLogs,
  getEventSummary,
  getUserStats,
} = require("../controllors/analytics.controller");
const router = express.Router();

router.post(
  "/collect",
  validateRequest(collectLogsSchema),
  verifyUserToken,
  collectLogs
);
router.get("/event-summary", verifyUserToken, getEventSummary);
router.get("/user-stats", verifyUserToken, getUserStats);

module.exports = router;
