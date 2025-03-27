const crypto = require("crypto");
const bcrypt = require('bcrypt')
module.exports.generateApiKey = () => {
    return crypto.randomBytes(32).toString("hex"); // 64-character key
};
module.exports.hashApiKey = async (apiKey)  =>{
    const saltRounds = 10;
    return await bcrypt.hash(apiKey, saltRounds);
}