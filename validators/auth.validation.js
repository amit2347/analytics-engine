const Joi = require("joi");

const registerAppSchema = {
  body: Joi.object({
    appName: Joi.string().min(1).max(255).required(),
    appUrl: Joi.string().uri().required(),
  }),
};
const getApiKeySchema = {
  query: Joi.object({
    appName: Joi.string().min(1).max(255).required(),
  }),
};
const revokeApiKeySchema = {
  body: Joi.object({
    apiKey: Joi.string().min(1).required(),
  }),
};
module.exports = {
  registerAppSchema,
  getApiKeySchema,
  revokeApiKeySchema,
};
