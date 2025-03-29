const Joi = require("joi");
const collectLogsSchema = {
  body: Joi.object({
    event: Joi.string().min(1).max(255).required(),
    referrer: Joi.string().uri().optional(),
    device: Joi.string().min(1).max(100).required(),
    ipAddress: Joi.string()
      .ip({ version: ["ipv4", "ipv6"] }) // Ensures valid IP format
      .required(),
    metadata: Joi.object({
      browser: Joi.string().min(1).max(100).required(),
      os: Joi.string().min(1).max(100).required(),
      screenSize: Joi.string()
        .pattern(/^\d{3,5}x\d{3,5}$/)
        .required(), // Validates format like "1080x1920"
    }).required(),
  }),
};
const eventSummarySchema = {
  query: Joi.object({
    event: Joi.string().min(1).max(255).required(),

    startDate: Joi.date().iso().optional().messages({
      "date.format": "startDate must be in YYYY-MM-DD format",
    }),

    endDate: Joi.date().iso().optional().messages({
      "date.format": "endDate must be in YYYY-MM-DD format",
    }),

    app_id: Joi.string().optional(),
  }),
};
const userStatusSchema = {
  query: Joi.object({
    userId: Joi.string().required(),
  }),
};
module.exports = {
  collectLogsSchema,
  eventSummarySchema,
  userStatusSchema,
};
