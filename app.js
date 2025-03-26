const { connectToDB } = require("./config/db");
const { connectToRedis } = require("./config/redis");
const startApp = async () => {
  try {
    await connectToDB();
    await connectToRedis();
    // Continue with your app logic
  } catch (error) {
    console.error("Error initializing connections:", error);
  }
};
startApp();
