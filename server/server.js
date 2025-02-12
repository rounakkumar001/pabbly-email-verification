const express = require('express');
const app = express();
require('dotenv').config();
const dbConfig = require('./config/database');
const setupMongoSession = require('./config/session-mongo');
const corsMiddleware = require('./config/cors');
const helmetMiddleware = require('./config/helmet');
const cacheControl = require('./config/cache-control');
const passport = require('passport');
require('./config/passport');
const cookieParser = require('cookie-parser');
const compression = require('compression');

/**
 * Use the custom CORS middleware
 */
app.use(corsMiddleware);

/**
 * Use the custom Helmet middleware
 */
app.use(helmetMiddleware);

/**
 * Use the custom Cache Control middleware
 */
app.use(cacheControl);

/**
 * Compresses response bodies for all requests to improve performance.
 */
app.use(compression());

/**
 * Middleware for parsing cookies
 */
app.use(cookieParser());
/**
 * Parse request json
 */
app.use(express.json());

/**
 * Parses incoming requests with URL-encoded payloads
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Use the Mongo session middleware
 */
app.use(setupMongoSession());

/**
 * Initialize Passport middleware
 */
app.use(passport.initialize());
app.use(passport.session());


/**
 *  Import load routes module
 */
const loadRoutes = require('./config/routes');

/**
 * Automatically load and bind routes
 */
loadRoutes(app);

const port = process.env.PORT || 3000;

//Check database connection and initialize the server
async function startServer() {
    try {
        // For Mongoose
        await dbConfig.connection.once('open', () => {
            console.log('Connection to the MongoDB database has been established successfully.');
        });

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

startServer();