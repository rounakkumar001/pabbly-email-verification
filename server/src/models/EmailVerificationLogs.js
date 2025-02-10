const mongoose = require('mongoose');

const emailVerificationLogSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
    },
    created_at: {
        type: Date,
        default: Date.now // Automatically set to current date
    },
    message: {
        type: String, // Message related to the verification process
    },
    status: {
        type: String,
        enum: ['VERIFIED_LIST', 'VERIFIED_EMAIL', 'PENDING', 'FAILED', 'VERIFYING', 'COMPLETED', 'PROCESSING', 'UNPROCESSED'],
        required: true // Ensure status is always provided
    },
    credits: {
        type: String,
        enum:  ['CONSUMED', 'ALLOTTED', 'PENDING', 'NOT_CONSUMED'],
        default: 'CONSUMED' // Default value for credits
    },
    no_of_credits: {
        type: Number,
        default: 1 // Default number of credits
    },
    source_type: {
        type: String,
        enum: ['EMAIL', 'CSV'],
        required: true // Ensure source type is always provided
    },
    source_name: {
        type: String, // Email ID or CSV file name
    },
    job_id: {
        type: String,
        default: '' // Default to an empty string
    },
    deliverable: {
        type: Number,
        default: 0 // Default count of deliverable emails
    },
    undeliverable: {
        type: Number,
        default: 0 // Default count of undeliverable emails
    },
    unknown: {
        type: Number,
        default: 0 // Default count of unknown emails
    },
    accept_all: {
        type: Number,
        default: 0 // Default count for accept-all responses
    },
    total_emails: {
        type: Number,
        default: 0 // Default total number of emails processed
    }
});

const EmailVerificationLog = mongoose.model('EmailVerificationLog', emailVerificationLogSchema);

module.exports = EmailVerificationLog;
