const express = require('express');
const router = express.Router();
const EmailVerificationController = require('../controllers/backend/EmailVerificationController');
const upload = require('../middlewares/multer');

router.post('/single', EmailVerificationController.verifySingleEmail);

router.post('/bulk-upload', upload.single('csv_file'), EmailVerificationController.uploadBulkEmail);

router.get('/bulk/status', EmailVerificationController.checkJobStatus);

router.get('/bulk/start', EmailVerificationController.startEmailVerification);

router.post('/bulk/download', EmailVerificationController.downloadBulkResults);

router.get('/credits', EmailVerificationController.getBouncifyCredits);

router.get('/logs', EmailVerificationController.fetchEmailVerificationLogs);

router.delete('/bulk-list', EmailVerificationController.deleteEmailList);


module.exports = router;
