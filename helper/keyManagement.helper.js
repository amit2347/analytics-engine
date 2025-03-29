const { AppDataSource } = require("../config/db");
const redisClient = require("../config/redis");
const apiKeyRepo = AppDataSource.getRepository("ApiKey");
const jwt = require("jsonwebtoken");

const { v4: uuidv4 } = require("uuid");

/**
 * Generate API Key (JWT Token)
 */
async function generateApiKey(userId, appId) {
  // Revoke old key if exists
  const existingKey = await apiKeyRepo.findOne({ where: { userId, appId } });
  if (existingKey) {
    await revokeApiKey(existingKey.jti);
    await apiKeyRepo.delete({ userId, appId });
  }

  // Generate new key
  const jti = uuidv4(); // Unique identifier for token
  const token = jwt.sign(
    { userId, appId, jti },
    process.env.API_KEY_SECRET_KEY,
    { expiresIn: "24h" }
  );

  // Store in DB
  const apiKeyEntity = apiKeyRepo.create({ userId, appId, jti });
  await apiKeyRepo.save(apiKeyEntity);

  return token;
}
/**
 * Revoke API Key
 */
async function revokeApiKey(jti) {
  console.log(jti);
  return await redisClient.set(`revoked:${jti}`, "1", "EX", 86400 * 7);
}

/**
 * Validate API Key
 */
async function validateApiKey(token) {
  try {
    const decoded = jwt.verify(token, process.env.API_KEY_SECRET_KEY);
    const isRevoked = await redisClient.get(`revoked:${decoded.jti}`);
    if (isRevoked) return false; // Token is revoked
    return { userId: decoded.userId, appId: decoded.appId };
  } catch (error) {
    console.error(error);
    return null; // Invalid token
  }
}

module.exports = {
  generateApiKey,
  revokeApiKey,
  validateApiKey,
};
