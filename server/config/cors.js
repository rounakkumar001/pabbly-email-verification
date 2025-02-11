const cors = require('cors');
const allowedDomain = process.env.ROOT_DOMAIN;

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:3031', 'pabbly.com']; // Add your allowed origins

        if (!origin) {
            // For requests without an origin (e.g., from curl, Postman)
            return callback(null, true); // Or handle as you see fit (e.g., block)
        }

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            const error = new Error('Not allowed by CORS');
            error.status = 403;
            return callback(error, false);
        }
    },
    methods: 'GET, POST, PUT, DELETE, OPTIONS, PATCH', // Specify allowed methods
    allowedHeaders: 'Content-Type, Content-Length, Accept-Encoding, X-Requested-With, Authorization,  x-csrf-token', // Specify allowed headers
    credentials: true, // VERY IMPORTANT: Allow credentials
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;