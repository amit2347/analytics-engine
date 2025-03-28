const { DataSource } = require("typeorm");
const Event = require("../entities/Event");
const EventSummary = require("../entities/EventSummary");
const User = require("../entities/User");
const UserAnalytics = require("../entities/UserAnalytics");
const ApplicationData = require("../entities/applicationData");
const apiKeys = require("../entities/apiKeys");
require("dotenv").config();

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: [
    Event,
    EventSummary,
    User,
    UserAnalytics,
    ApplicationData,
    apiKeys,
  ], // Path to your entities
});

async function connectToDB() {
  try {
    await AppDataSource.initialize();
    console.log("Database connection initialized");
  } catch (error) {
    console.error("Error during database initialization:", error);
    throw error;
  }
}

module.exports = { connectToDB, AppDataSource };
