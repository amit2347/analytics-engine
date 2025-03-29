const jwt = require("jsonwebtoken");
const User = require("../entities/User");
const applicationDataRepository = require("../entities/applicationData.js");
const { AppDataSource } = require("../config/db");
const {
  generateApiKey,
  revokeApiKey,
} = require("../helper/keyManagement.helper.js");
const apiKeys = require("../entities/apiKeys.js");
module.exports.getProfileDetails = async (req, res) => {
  const jsonSecret = process.env.JSON_SECRET_KEY;
  const userDetails = req.user;
  if (!userDetails) {
    return res.redirect("/");
  }
  const secretToken = jwt.sign({ id: userDetails.id }, jsonSecret, {
    expiresIn: "1h",
  });
  return res.send({
    message: "User authenticated successfully.",
    secretToken,
  });
};
module.exports.registerApplication = async (req, res) => {
  const payload = req.body;
  try {
    const userId = req.userContext.id;
    const userDetails = await AppDataSource.getRepository(User).findOne({
      where: {
        id: userId,
      },
    });
    if (!userDetails) {
      return res.status(404).send({
        message: "No Details found",
      });
    }
    const appName = payload.appName;
    const appUrl = payload.appUrl;
    const appData = AppDataSource.getRepository(
      applicationDataRepository
    ).create({
      appName: appName,
      appUrl: appUrl,
      ownerUser: userDetails,
    });
    await AppDataSource.getRepository(applicationDataRepository).save(appData);
    return res.status(200).send({
      message: "App Registered Successfully.",
    });
  } catch (e) {
    console.error(e);
    return res.status(400).send({ message: "something went wrong" });
  }
};

module.exports.getApiKey = async (req, res) => {
  const { appName } = req.query;
  const userId = req.userContext.userId;

  try {
    // Fetch the app record
    const appData = await AppDataSource.getRepository(
      applicationDataRepository
    ).findOne({
      where: { appName },
    });

    if (!appData) {
      return res.status(404).send({ message: "App not found." });
    }

    // Generate a new API key
    const token = await generateApiKey(userId, appData.id);
    return res.status(200).send({
      message: "Token Generated Successfully",
      token,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ message: "Something went wrong." });
  }
};
module.exports.revokeApiKey = async (req, res) => {
  const token = req.body.apiKey;

  try {
    const decodedToken = jwt.verify(token, process.env.API_KEY_SECRET_KEY);
    const revokeStatus = await revokeApiKey(decodedToken.jti);
    if (revokeStatus) {
      await AppDataSource.getRepository(apiKeys).delete({
        userId: decodedToken.userId,
        appId: decodedToken.appId,
      });
      return res.status(200).send({
        message: "API key successfully revoked. It can no longer be used.",
      });
    }
    return res.status(401).send({
      message: "Token is invalid or expired.",
    });
    // Respond with success
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "An error occurred during revocation." });
  }
};
