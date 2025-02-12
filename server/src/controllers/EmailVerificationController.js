const Logs = require('../utils/logs');
const Response = require('../utils/response');
const { validationResult, body } = require('express-validator');
const FormData = require('form-data');
const { Readable } = require('stream');
const { CreditHistory, EmailVerificationLog } = require('../models');
const BouncifyService = require('../services/bouncify-service')

const bouncifyService = new BouncifyService(process.env.BOUNCIFY_API_KEY);

module.exports = {

    /**
   * @description Verifies a single email address using the Bouncify API.
   * Consumes one credit and logs the verification result.
   *
   * @function verifySingleEmail
   * @async
   * @param {string} req.body.email
   * @param {Object} res 
   */
    verifySingleEmail: async (req, res) => {
        try {
            // 1. Validate email input using express-validator
            await body('email').isEmail().withMessage('Invalid email address').run(req);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(Response.error("Validation failed.", errors.array()));
            }

            const { email } = req.body;

            // 2. Call Bouncify API to verify email using the service
            const bouncifyResponse = await bouncifyService.verifyEmail(email);

            // 3. Update credit history and log verification result
            try {
                // 3a. Update credit history (decrement credits_remaining)
                const updatedCreditHistory = await CreditHistory.findOneAndUpdate(
                    { user_id: req.user.id },
                    { $inc: { credits_remaining: -1 } },
                    { new: true } // Return the updated document
                );

                if (!updatedCreditHistory) {
                    return res.status(404).json(Response.error("Credit history not found for this user."));
                }

                // 3b. Create and save email verification log entry
                const logEntry = new EmailVerificationLog({
                    user_id: req.user.id,
                    message: bouncifyResponse.message || 'Email verification successful', // Use the response message
                    status: "VERIFIED_EMAIL",
                    credits: "CONSUMED",
                    source_type: "EMAIL",
                    source_name: email,
                    deliverable: bouncifyResponse.result === 'deliverable' ? 1 : 0,
                    undeliverable: bouncifyResponse.result === 'undeliverable' ? 1 : 0,
                    unknown: bouncifyResponse.result === 'unknown' ? 1 : 0,
                    accept_all: bouncifyResponse.accept_all || false,
                    total_emails: 1,
                    job_id: '', // Empty string or provide a default if needed
                    no_of_credits: 1,
                });

                await logEntry.save();

                // 4. Return success response with the log entry
                return res.json(Response.success("Email verification result", logEntry));

            } catch (creditOrLogError) { // Catch errors related to credit update or logging
                Logs.error("Error updating credit history or logging verification:", creditOrLogError);
                return res.status(500).json(Response.error("Error processing email verification.")); // Generic message to the client
            }

        } catch (emailVerificationError) { // Catch errors related to email verification itself
            Logs.error("Error verifying email:", emailVerificationError);
            return res.status(500).json(Response.error('An error occurred while verifying the email.', emailVerificationError.message)); // Send error with the original message for debugging
        }
    },

    /**
    * @description Fetches email verification logs for the authenticated user.
    *
    * @function fetchEmailVerificationLogs
    * @async
    * @param {Object} req.user - Information about the authenticated user. This property is expected to be populated by authentication middleware. It should contain a property `id` (e.g., `req.user.id`) representing the user's ID.
    * @param {Object} res - The Express.js response object. This object is used to send the response back to the client.
    */
    fetchEmailVerificationLogs: async (req, res) => {
        try {
            // Fetch email verification logs for the user, sorted by dateCreatedOn (newest first)
            const userLogs = await EmailVerificationLog.find({ user_id: req.user.id }).sort({ created_at: -1 });

            // Return success response with the logs
            return res.json(Response.success("Email verification logs retrieved successfully.", userLogs)); // More descriptive message

        } catch (error) { // More general error name
            Logs.error("Error fetching email verification logs:", error); // More descriptive message
            return res.status(500).json(Response.error('An error occurred while fetching email verification logs.', error.message)); // Include original message for debugging
        }
    },

    /**
     * @description Updates the allotted credits for a user.
     *
     * @function updateCredits
     * @async
     * @param {Object} req.body.credit_allot - The request body.  Specifically, the number of credits to allot is expected to be present as `req.body.credit_allot`.
     * @param {Object} req.user - Information about the authenticated user. This property is expected to be populated by authentication middleware. It should contain a property `id` (e.g., `req.user.id`) representing the user's ID.
     * @param {Object} res - The Express.js response object. This object is used to send 
     */
    updateCredits: async (req, res) => {
        try {
            const allotted = req.body?.credit_allot; // Safe access using optional chaining

            if (!allotted) {
                return res.status(400).json(Response.error('The number of credits to allot is required in the request body.')); // 400 Bad Request is more appropriate
            }

            // Convert allotted to a Number if it's a string (important for database updates)
            const allottedNumber = Number(allotted);
            if (isNaN(allottedNumber)) {
                return res.status(400).json(Response.error('Invalid credit amount provided.'));
            }


            const updatedCreditHistory = await CreditHistory.findOneAndUpdate(
                { user_id: req.user.id },
                { credits_allotted: allottedNumber }, // Use allottedNumber
                { new: true, runValidators: true } // Return the updated document and run validators
            );

            if (!updatedCreditHistory) {
                return res.status(404).json(Response.error("Credit history not found for this user."));
            }

            return res.json(Response.success('Credits updated successfully.')); // Success message, no need to send the updated object unless needed

        } catch (error) {
            Logs.error("Error updating credits:", error); // More descriptive message
            return res.status(500).json(Response.error('An error occurred while updating credits.', error.message)); // Use error.message, not err.error.message
        }
    },

    /**
     * @description Uploads a CSV file for bulk email verification to the Bouncify API.
     *
     * @function uploadBulkEmail
     * @async
     * @param {Object} req.user - Information about the authenticated user. This property is expected to be populated by authentication middleware. It should contain a property `id` (e.g., `req.user.id`) representing the user's ID.
     * @param {Object} req.file - The uploaded file object.  This property is added by middleware (e.g., Multer) and contains information about the uploaded file, including the file buffer (`req.file.buffer`) and original filename (`req.file.originalname`).
     * @param {Object} res - The Express.js response object. This object is used to send the response back to the client.
     */
    uploadBulkEmail: async (req, res) => {

        try {
            const uniqueKey = Date.now(); // Add a timestamp to the filename for uniqueness

            if (!req.file) {
                return res.status(400).json(Response.error("No file uploaded. Please upload a CSV file.")); // More specific message
            }

            const autoVerify = req.body.auto_verify !== undefined ? req.body.auto_verify : true; // Allow override

            const fileStream = new Readable({
                read() {
                    this.push(req.file.buffer); // Push the file buffer to the stream
                    this.push(null); // Signal the end of the stream
                },
            });

            const formData = new FormData();
            formData.append('local_file', fileStream, `${req.file.originalname}-${uniqueKey}`); // Append the file stream to the form data


            // Use the BouncifyService to upload the bulk email
            const bouncifyResponse = await bouncifyService.uploadBulkEmail(req.file.buffer, `${req.file.originalname}-${uniqueKey}`, autoVerify);

            // Create a log entry for the bulk upload
            const logEntry = new EmailVerificationLog({
                user_id: req.user.id,
                message: bouncifyResponse.message,
                status: "UNPROCESSED", // Initial status
                credits: "CONSUMED", // Assuming credits are consumed upon upload
                source_type: "CSV",
                source_name: `${req.file.originalname}-${uniqueKey}`,
                deliverable: 0, // Initialize to 0, will be updated later by Bouncify
                undeliverable: 0,
                unknown: 0,
                accept_all: bouncifyResponse.accept_all || 0, // Default to 0 if not provided
                total_emails: 0, // Will be updated by Bouncify
                job_id: bouncifyResponse.job_id,
                no_of_credits: 0, // Will be updated later
            });

            await logEntry.save();

            return res.json(Response.success("Bulk email verification initiated.", bouncifyResponse)); // Include Bouncify's response

        } catch (error) {
            Logs.error("Bouncify API Error:", error.response ? error.response.data : error.message);

            const errorMessage = error.response && error.response.data && error.response.data.message ?
                error.response.data.message :
                (error.message || "Bouncify API Error");

            return res.status(500).json(Response.error('An error occurred while verifying bulk emails.', errorMessage));
        }
    },

    /**
    * @description Checks the status of a bulk email verification job using the Bouncify API.
    * Updates the corresponding EmailVerificationLog entry if the job is complete.
    *
    * @function checkJobStatus
    * @async
    * @param {string} req.query.job_id - The query parameters.  Specifically, the job ID is expected to be present as `req.query.job_id`.
    * @param {Object} res - The Express.js response object. This object is used to send the response back to the client.
    */
    checkJobStatus: async (req, res) => {
        try {
            const jobId = req.query.job_id;

            if (!jobId) {
                return res.status(400).json(Response.error("Job ID is required in the query parameters."));
            }

            // Use the BouncifyService to check the job status
            const response = await bouncifyService.checkJobStatus(jobId);

            // Check if the job is complete
            if (response.total === response.verified) {
                try { // Inner try-catch for logging/DB errors
                    const jobVerification = await EmailVerificationLog.findOne({ job_id: jobId });

                    if (!jobVerification) {
                        return res.status(404).json(Response.error("Job verification log not found."));
                    }

                    // Update the job verification log
                    jobVerification.message = "Verification Successful";
                    jobVerification.status = "VERIFIED_LIST";
                    jobVerification.deliverable = response.results?.deliverable || 0; // Optional chaining
                    jobVerification.undeliverable = response.results?.undeliverable || 0;
                    jobVerification.unknown = response.results?.unknown || 0;
                    jobVerification.accept_all = response.results?.accept_all || 0;
                    jobVerification.total_emails = response.total;
                    jobVerification.no_of_credits = response.total; // Or calculate based on pricing

                    await jobVerification.save();

                } catch (logError) {
                    Logs.error("Error updating job verification log:", logError);
                    // Decide if you want to return an error to the client here or just log it
                }
            }

            return res.json(Response.success("Job status retrieved", response));

        } catch (error) {
            Logs.error("Error checking job status:", error); // More descriptive message

            if (error.response) {
                return res.status(error.response.status).json(Response.error('Error retrieving job status', error.response.data));
            }

            return res.status(500).json(Response.error('An unexpected error occurred while checking job status.', error.message));
        }
    },

    /**
     * @description Downloads bulk email verification results from the Bouncify API.
     * Allows filtering results based on deliverability.
     *
     * @function downloadBulkResults
     * @async
     * @param {string} req.body.jobId - The ID of the bulk verification job.
     * @param {string} req.body.selectedOption - The filter option ('deliverable', 'undeliverable', or other for all).
     * @param {Object} res - The Express.js response object. This object is used to send the file stream back to the client.
     */
    downloadBulkResults: async (req, res) => {

        try {

            const { jobId, selectedOption } = req.body;
            const apiKey = process.env.BOUNCIFY_API_KEY;

            // Input Validation
            if (!jobId || typeof jobId !== 'string' || !jobId.trim()) {
                return res.status(400).json(Response.error('Invalid jobId', 'jobId is required.'));
            }
            if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
                return res.status(400).json(Response.error('Invalid apiKey', 'apiKey is required.'));
            }

            let filterResult = [];

            switch (selectedOption) {
                case 'deliverable':
                    filterResult = ['deliverable'];
                    break;
                case 'undeliverable':
                    filterResult = ['undeliverable'];
                    break;
                default: // Default case: all results
                    filterResult = ['deliverable', 'undeliverable', 'accept_all', 'unknown'];
            }


            // const response = await axios.post(url, { filterResult }, { responseType: 'stream' });
            const response = await bouncifyService.downloadBulkResults(jobId, filterResult);

            // Extract filename from Content-Disposition header
            const filename = response.headers['content-disposition']?.match(/filename\*=UTF-8''([^"]+)/)?.[1] ||
                response.headers['content-disposition']?.match(/filename="([^"]+)"/)?.[1] ||
                `results_${jobId}.csv`;

            const decodedFilename = decodeURIComponent(filename); // Decode filename if it was encoded

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${decodedFilename}"`);

            // Pipe the stream to the response
            response.data.pipe(res);

        } catch (error) {
            Logs.error("Bouncify Download Error:", error.response ? error.response.data : error.message); // Use Logs.error

            let errorMessage = "Download failed.";
            let statusCode = 500;

            if (error.response) {
                const { status, data } = error.response;
                statusCode = status;
                errorMessage = data?.message || data?.error || "Server Error"; // More robust error message extraction
                if (status === 401) {
                    errorMessage = "Invalid API Key";
                }
            } else if (error.request) {
                errorMessage = "No response from server.";
                Logs.error("Bouncify API Request Error:", error.request); // Use Logs.error
            } else {
                errorMessage = error.message;
                Logs.error("Axios setup or other error:", error.message); // Use Logs.error
            }

            return res.status(statusCode).json(Response.error('Download failed.', errorMessage)); // Consistent error response
        }
    },

    /**
     * @description Retrieves email credit information from Bouncify and updates the local CreditHistory.
     *
     * @function getBouncifyCredits
     * @async
     * @param {Object} req.user - Information about the authenticated user. This property is expected to be populated by authentication middleware. It should contain a property `id` (e.g., `req.user.id`) representing the user's ID.
     */
    getBouncifyCredits: async (req, res) => {

        try {
            if (!req.user || !req.user.id) {
                Logs.error("User information is missing in the request.");
                return res.status(401).json(Response.error("Unauthorized. User information is missing."));
            }

            // const { credits_remaining } = response.data.credits_info;
            const { credits_remaining } = await bouncifyService.getCreditsInfo();

            if (credits_remaining === undefined) {
                const errorMessage = "Credits information not found in Bouncify response.";
                Logs.error(errorMessage, response.data);
                return res.status(500).json(Response.error(errorMessage));
            }

            // 2. Update local CreditHistory
            let userCreditHistory = await CreditHistory.findOne({ user_id: req.user.id });

            if (!userCreditHistory) {
                userCreditHistory = new CreditHistory({
                    user_id: req.user.id,
                    credits_remaining: credits_remaining,
                });

                await userCreditHistory.save();
            } else {
                userCreditHistory = await CreditHistory.findOneAndUpdate(
                    { user_id: req.user.id },
                    { $set: { credits_remaining: credits_remaining } },
                    { new: true, runValidators: true } // Ensure validators are run
                );
            }

            // 3. Calculate consumed credits
            const allotted = userCreditHistory.credits_allotted || 0; // Default to 0 if null
            const remaining = userCreditHistory.credits_remaining;
            const consumed = allotted - remaining;

            // 4. Return credit information
            return res.json(Response.success("Email credits retrieved", {
                credits_allotted: allotted,
                credits_consumed: consumed,
                credits_remaining: remaining,
            }));

        } catch (error) {
            Logs.error('Error fetching email credits:', error);

            let errorMessage = "Error retrieving email credits.";
            let statusCode = 500;

            if (error.response) {
                Logs.error("Bouncify API Error Response Data:", error.response.data);
                statusCode = error.response.status;
                errorMessage = error.response.data.message || "Error retrieving email credits from Bouncify."; // More specific message
            } else if (error.request) {
                Logs.error("Bouncify API Request Error:", error.request);
                errorMessage = "No response received from Bouncify API.";
            } else {
                Logs.error("Axios setup or other error:", error.message);
                errorMessage = "An unexpected error occurred."; // More generic for other errors
            }

            return res.status(statusCode).json(Response.error(errorMessage));
        }
    },

    /**
     * @description Starts the bulk email verification process for a given job ID using the Bouncify API.
     * Updates the corresponding EmailVerificationLog entry with the status.
     *
     * @function startEmailVerification
     * @async
     * @param {string} req.query.job_id - The query parameters.  Specifically, the job ID is expected to be present as `req.query.job_id`.
     */
    startEmailVerification: async (req, res) => {

        try {

            const jobId = req.query.job_id;

            if (!jobId || typeof jobId !== 'string' || !jobId.trim()) {
                return res.status(400).json(Response.error("Invalid jobId", "jobId is required."));
            }

            // 1. Start email verification via Bouncify API using the service
            const response = await bouncifyService.startEmailVerification(jobId);

            // 2. Update the corresponding log entry
            const updatedLogEntry = await EmailVerificationLog.findOneAndUpdate(
                { job_id: jobId },
                {
                    status: "PROCESSING",
                    message: response.message || "Email verification started", // Use Bouncify's message if available
                },
                { new: true, runValidators: true } // Run validators
            );

            if (!updatedLogEntry) {
                const errorMessage = `Log entry not found for job_id: ${jobId}.`;
                Logs.error(errorMessage); // Use Logs.error
                return res.status(404).json(Response.error(errorMessage));
            }

            // 3. Respond with success
            return res.json(Response.success("Email verification started", updatedLogEntry)); // Return updated log entry

        } catch (error) {
            Logs.error("Bouncify Start Verification Error:", error); // Use Logs.error
            let errorMessage = "Failed to start email verification.";

            if (error.response) {
                Logs.error("Bouncify Error Response Data:", error.response.data); // Use Logs.error
                errorMessage = error.response.data.message || errorMessage; // Extract message from Bouncify response
            } else if (error.request) {
                errorMessage = "No response received from Bouncify API.";
                Logs.error("Bouncify API Request Error:", error.request); // Use Logs.error
            } else {
                errorMessage = error.message || "An unexpected error occurred."; // More generic for setup/other errors
                Logs.error("Axios setup or other error:", error); // Use Logs.error
            }

            // Attempt to update the log entry with the failure status (even if it doesn't exist)
            try {
                await EmailVerificationLog.findOneAndUpdate(
                    { job_id: jobId },
                    {
                        status: "FAILED",
                        message: errorMessage, // Use the extracted error message
                    },
                    { new: true, runValidators: true } // Run validators
                );
            } catch (logError) {
                Logs.error("Error updating log entry with failure status:", logError);
            }

            return res.status(500).json(Response.error('Failed to start email verification', errorMessage)); // Consistent error response
        }
    },

    /**
    * @description Deletes an email list (bulk verification job) using the Bouncify API.
    * Also deletes the corresponding EmailVerificationLog entry.
    *
    * @function deleteEmailList
    * @async
    * @param {string} req.query.job_id - The query parameters.  Specifically, the job ID is expected to be present as `req.query.job_id`.
    * @param {Object} res - The Express.js response object. This object is used to send the response back to the client.
    */
    deleteEmailList: async (req, res) => {

        try {
            const jobId = req.query.job_id;

            if (!jobId || typeof jobId !== 'string' || !jobId.trim()) {
                return res.status(400).json(Response.error("Invalid jobId", "jobId is required."));
            }

            // 1. Delete the email list via Bouncify API using the service
            await bouncifyService.deleteEmailList(jobId);

            // 2. Delete the corresponding log entry
            const deletedLogEntry = await EmailVerificationLog.findOneAndDelete({ job_id: jobId });

            if (!deletedLogEntry) {
                const warnMessage = `Log entry not found for job_id: ${jobId} during database delete operation.`;
                Logs.warn(warnMessage); // Use Logs.warn
                return res.status(404).json(Response.error("Log entry not found."));
            }

            // 3. Respond with success and the deleted log entry
            return res.json(Response.success("Email list and log entry deleted successfully.", deletedLogEntry));

        } catch (error) {
            Logs.error("Error deleting email list:", error); // Use Logs.error
            let errorMessage = "Failed to delete email list.";
            let statusCode = 500;

            if (error.response) {
                Logs.error("Bouncify API Error Response Data:", error.response.data); // Use Logs.error
                statusCode = error.response.status;
                errorMessage = error.response.data.message || errorMessage;
            } else if (error.request) {
                Logs.error("Bouncify API Request Error:", error.request); // Use Logs.error
                errorMessage = "No response received from Bouncify API.";
            } else {
                Logs.error("Axios setup or other error:", error.message); // Use Logs.error
                errorMessage = "Request setup or other error.";
            }

            return res.status(statusCode).json(Response.error(errorMessage));
        }
    },

}