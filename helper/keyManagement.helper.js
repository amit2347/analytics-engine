const { AppDataSource } = require("../config/db");
const redisClient = require("../config/redis");
const apiKeyRepo = AppDataSource.getRepository("ApiKey");
const jwt = require("jsonwebtoken");

const { v4: uuidv4 } = require("uuid");
const User = require("../entities/User");
const applicationData = require("../entities/applicationData");

/**
 * Generate API Key (JWT Token)
 */
async function generateApiKey(userId, appId) {
  // Revoke old key if exists
  const existingKey = await apiKeyRepo.findOne({
    where: {
      user: { id: userId },
      application: { id: appId },
    },
  });
  if (existingKey) {
    await revokeApiKey(existingKey.jti);
    await apiKeyRepo.delete({
      user: { id: userId },
      application: { id: appId },
    });
  }
  const userDetails = await AppDataSource.getRepository(User).findOne({
    where: {
      id: userId,
    },
  });
  const appDetails = await AppDataSource.getRepository(applicationData).findOne(
    {
      where: {
        id: appId,
      },
    }
  );
  // Generate new key
  const jti = uuidv4(); // Unique identifier for token
  const token = jwt.sign(
    { userId, appId, jti },
    process.env.API_KEY_SECRET_KEY,
    { expiresIn: "24h" }
  );

  // Store in DB
  const apiKeyEntity = apiKeyRepo.create({
    user: userDetails,
    application: appDetails,
    jti,
  });
  await apiKeyRepo.save(apiKeyEntity);
  return token;
}
/**
 * Revoke API Key
 */
async function revokeApiKey(jti) {
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
    return null; // Invalid token
  }
}

module.exports = {
  generateApiKey,
  revokeApiKey,
  validateApiKey,
};
