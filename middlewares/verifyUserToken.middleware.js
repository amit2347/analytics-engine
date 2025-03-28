const jwt = require("jsonwebtoken");

module.exports.verifyUserToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({
      message: "Token Missing or invalid",
    });
  }
  const authToken = authHeader.split(" ")[1]; // Extract token part
  try {
    const decodedData = jwt.verify(authToken, process.env.JSON_SECRET_KEY);
    if (decodedData.userId && decodedData.appId) {
      req["userContext"] = { userId: decodedData.userId };
      req["userContext"] = { appId: decodedData.appId };
    } else {
      return res.status(401).send({
        message: "Token Missing or invalid",
      });
    }
    next();
  } catch (e) {
    console.error(e);
    return res.status(401).send({
      message: "Token Missing or invalid",
    });
  }
};
