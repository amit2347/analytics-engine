const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    //entities: [require('../entities/User.js')], // Path to your entities
});

async function connectToDB() {
    try {
        await AppDataSource.initialize();
        console.log('Database connection initialized');
    } catch (error) {
        console.error('Error during database initialization:', error);
        throw error;
    }
}

module.exports = { connectToDB, AppDataSource };
