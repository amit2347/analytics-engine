const express = require("express");
const {
  verifyUserToken,
} = require("../middlewares/verifyUserToken.middleware");
const {
  validateRequest,
} = require("../middlewares/schemaValidation.middlewares");
const {
  collectLogsSchema,
  eventSummarySchema,
  userStatusSchema,
} = require("../validators/analytics.validation");
const {
  collectLogs,
  getEventSummary,
  getUserStats,
} = require("../controllors/analytics.controller");

const router = express.Router();

/**
 * @swagger
 * /analytics/collect:
 *   post:
 *     summary: Collect logs
 *     description: Stores event logs for analytics processing.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: Event name (e.g., "click", "view")
 *                 example: "click"
 *               referrer:
 *                 type: string
 *                 format: uri
 *                 description: URL of the referrer (optional)
 *                 example: "https://example.com"
 *               device:
 *                 type: string
 *                 description: User's device type
 *                 example: "mobile"
 *               ipAddress:
 *                 type: string
 *                 format: ipv4
 *                 description: IP address of the user
 *                 example: "192.168.1.1"
 *               metadata:
 *                 type: object
 *                 description: Additional user details
 *                 properties:
 *                   browser:
 *                     type: string
 *                     description: Browser name
 *                     example: "Chrome"
 *                   os:
 *                     type: string
 *                     description: Operating system
 *                     example: "Windows 10"
 *                   screenSize:
 *                     type: string
 *                     description: Screen resolution (width x height)
 *                     example: "1920x1080"
 *     responses:
 *       200:
 *         description: Log collected successfully.
 *       400:
 *         description: Invalid request format.
 */
router.post(
  "/collect",
  validateRequest(collectLogsSchema),
  verifyUserToken,
  collectLogs
);

/**
 * @swagger
 * /analytics/event-summary:
 *   get:
 *     summary: Get event summary
 *     description: Retrieves a summary of collected event logs.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: event
 *         schema:
 *           type: string
 *           example: "login_form_cta_click"
 *         required: true
 *         description: The event type to fetch summary data for.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-02-15"
 *         required: false
 *         description: Optional filter to specify start date (YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-02-20"
 *         required: false
 *         description: Optional filter to specify end date (YYYY-MM-DD).
 *       - in: query
 *         name: app_id
 *         schema:
 *           type: string
 *           example: "xyz123"
 *         required: false
 *         description: Optional filter to fetch data for a specific app. If omitted, fetches data across all apps created by the owner.
 *     responses:
 *       200:
 *         description: Event summary retrieved successfully.
 *       422:
 *         description: Invalid request parameters.
 *       401:
 *         description: Unauthorized, missing or invalid token.
 *       400:
 *         description: Bad Request.
 */
router.get(
  "/event-summary",
  validateRequest(eventSummarySchema),
  verifyUserToken,
  getEventSummary
);

/**
 * @swagger
 * /analytics/user-stats:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieves user-based analytics data.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           example: "asdasd-vcvcv-fdgetry"
 *         required: true
 *         description: The ID of the user whose stats are being retrieved.
 *     responses:
 *       200:
 *         description: User stats retrieved successfully.
 *       400:
 *         description: Invalid request parameters.
 *       401:
 *         description: Unauthorized, missing, or invalid token.
 */
router.get(
  "/user-stats",
  validateRequest(userStatusSchema),
  verifyUserToken,
  getUserStats
);

module.exports = router;
