const dotenv = require('dotenv');
dotenv.config();

require('../../config/database.js');

const User = require('./User.js');
const ActivityLog = require('./ActivityLog.js');
const CreditHistory = require('./CreditHistory.js');
const EmailVerificationLog = require('./EmailVerificationLogs.js');

module.exports = { User, ActivityLog, CreditHistory, EmailVerificationLog };