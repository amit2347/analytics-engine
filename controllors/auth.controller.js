const jwt = require("jsonwebtoken");
const { generateApiKey, hashApiKey } = require("../helper/auth.helper.js");
const User = require("../entities/User");
const applicationDataRepository = require("../entities/applicationData.js");
const { AppDataSource } = require("../config/db");
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
    const decodedData = jwt.verify(payload.token, process.env.JSON_SECRET_KEY);
    const userId = decodedData.id;
    const userDetails = await AppDataSource.getRepository(User).findOne({
      where: {
        id: userId,
      },
    });
    console.log(userDetails);
    const userCheck = await AppDataSource.getRepository(
      applicationDataRepository
    ).findOne({
      where: {
        ownerUser: {
          id: userDetails.id,
        },
      },
    });
    if (userCheck) {
      return res.status(404).send({
        message: "User is already associated with an App.",
      });
    }
    const apiKey = generateApiKey();
    const hashedApiKey = await hashApiKey(apiKey);
    const appName = payload.appName;
    const appUrl = payload.appUrl;
    const appData = AppDataSource.getRepository(
      applicationDataRepository
    ).create({
      appName: appName,
      appUrl: appUrl,
      ownerUser: userDetails,
      hashedApiKey: hashedApiKey,
    });
    await AppDataSource.getRepository(applicationDataRepository).save(appData);
    return res.status(200).send({
      message: "App Registered Successfully . Please keep token safe.",
      apiKey: apiKey,
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
    const userAuthToken = jwt.sign(
      { userId, appId: appData.id },
      process.env.JSON_SECRET_KEY
    );
    // Return the new API key to the client
    return res.status(200).send({
      message: "API key generated successfully. Please store it securely.",
      apiKey: userAuthToken,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ message: "Something went wrong." });
  }
};
module.exports.revokeApiKey = async (req, res) => {
  const { appId } = req.body;

  try {
    // Validate input
    if (!appId) {
      return res.status(400).send({ message: "App ID is required." });
    }

    // Fetch the app record
    const appData = await AppDataSource.getRepository(
      applicationDataRepository
    ).findOne({
      where: { id: appId },
    });

    if (!appData) {
      return res.status(404).send({ message: "App not found." });
    }

    // Revoke the API key by nullifying or marking it as invalid
    appData.revokeStatus = true; // Alternative: Use a status flag (e.g., revoked = true)
    await AppDataSource.getRepository(applicationDataRepository).save(appData);

    // Respond with success
    return res.status(200).send({
      message: "API key successfully revoked. It can no longer be used.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "An error occurred during revocation." });
  }
};
