const dotenv = require('dotenv');
dotenv.config();

let dbConfig;
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {});
dbConfig = mongoose;

module.exports = dbConfig;