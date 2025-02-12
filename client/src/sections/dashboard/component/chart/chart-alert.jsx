import { useDispatch, useSelector } from 'react-redux';

import { Box, Alert, Button, Typography } from '@mui/material';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { fetchEmailVerificationResults } from 'src/redux/slice/email-verification-slice';
import { resetUpload, completeVerification, startEmailVerification } from 'src/redux/slice/upload-slice';

export default function ChartAlert() {
  const dispatch = useDispatch();
  const { jobId, isStartVerification, isVerificationCompleted } = useSelector((state) => state.fileUpload)
  let timeoutId; 

  const handleStartVerification = () => {
    if (jobId) {
        dispatch(startEmailVerification(jobId))  // Dispatch the thunk
            .unwrap() // Unwrap the promise from the Thunk
            .then(() => {
                checkVerificationStatus(); // Call checkVerificationStatus *after* successful dispatch
            })
            .catch((error) => {
                console.error("Error starting verification:", error);
                // Handle error, maybe show a message to the user
                dispatch(completeVerification()); // Mark verification as complete even if there's an error
            });
    } else {
        alert("No job ID available. Please upload a file first.");
    }
};

const checkVerificationStatus = async () => {
    try {
        const response = await axiosInstance.get(
            `${endpoints.bouncify.checkBulkEmailVerificationStatus}?job_id=${jobId}`
        );

        const { data: { data: { status } } } = response;

        if (status === 'verifying' || status === 'ready') {
            dispatch(fetchEmailVerificationResults());
            timeoutId = setTimeout(checkVerificationStatus, 3000); // Call itself after 3 seconds
        } else if (status === 'completed') {
            dispatch(fetchEmailVerificationResults());
            dispatch(resetUpload());
        } else {
            console.log("Verification finished with status:", status);
        }
    } catch (error) {
        console.error("Error checking verification status:", error);
    } finally {
        clearTimeout(timeoutId); // Clear the timeout *in the finally block*
        dispatch(completeVerification()); // Always mark as complete in finally
    }
};

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column', // Stack items vertically
        alignItems: 'center', // Center horizontally
        justifyContent: 'center', // Center verticall
        mb: 3,
        mt: 6,
        px: 3,
      }}
    >
      <Alert severity="success" variant="outlined" sx={{ width: '100%' }}>
        <Typography variant="body1" fontWeight={600}>
          Uploaded Successfully
        </Typography>
      </Alert>
      {/* Conditional rendering for the button and loading indicator */}
      {!isStartVerification && !isVerificationCompleted && ( // Show button if verification hasn't started or completed
        <Button color="primary" sx={{ mt: 2 }} onClick={handleStartVerification} disabled={!jobId}> {/* Disable if no jobId */}
          Start Verification
        </Button>
      )}

    </Box>
  );
}
