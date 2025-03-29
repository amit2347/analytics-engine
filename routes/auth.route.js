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

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Authentication and API Key Management
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Redirects user to Google for authentication
 *     description: Initiates Google OAuth login flow.
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Google login page
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: Handles Google authentication callback after login.
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects user after authentication
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    successRedirect: "/auth/profile",
  }),
  (req, res) => {
    res.redirect("/auth/profile");
  }
);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile details
 *     description: Retrieves the authenticated user's profile details.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized, missing or invalid token
 */
router.get("/profile", getProfileDetails);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register an application for analytics
 *     description: Allows users to register an application to use analytics services.
 *     tags: [Authentication]
 *     security:
 *       - AuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appName:
 *                 type: string
 *                 example: "My App"
 *               appUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://myapp.com"
 *     responses:
 *       200:
 *         description: Application registered successfully
 *       422:
 *         description: Invalid request data
 *       400:
 *         description: Bad Request
 */
router.post(
  "/register",
  validateRequest(registerAppSchema),
  verifyTempToken,
  registerApplication
);

/**
 * @swagger
 * /auth/api-key:
 *   get:
 *     summary: Get API key
 *     description: Retrieves an API key for an authenticated application.
 *     tags: [Authentication]
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - in: query
 *         name: appName
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *         description: Name of the registered application.
 *     responses:
 *       200:
 *         description: API key retrieved successfully.
 *       400:
 *         description: Bad request, missing or invalid parameters.
 *       401:
 *         description: Unauthorized, missing or invalid token.
 *       422:
 *         description: Payload in invalid format.
 */
router.get(
  "/api-key",
  validateRequest(getApiKeySchema),
  verifyTempToken,
  getApiKey
);

/**
 * @swagger
 * /auth/revoke:
 *   post:
 *     summary: Revoke API key
 *     description: Revokes an existing API key.
 *     tags: [Authentication]
 *     security:
 *       - AuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 *                 example: "your-api-key"
 *     responses:
 *       200:
 *         description: API key revoked successfully
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       404:
 *         description: API key not found
 */
router.post(
  "/revoke",
  validateRequest(revokeApiKeySchema),
  verifyTempToken,
  revokeApiKey
);

module.exports = router;
