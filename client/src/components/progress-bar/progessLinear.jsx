/* eslint-disable consistent-return */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Typography } from '@mui/material';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { updateProgress } from 'src/redux/slice/upload-slice';

// Import the necessary actions

export default function ProgressLinear() {
  const dispatch = useDispatch();
  const { progress, isStartVerification } = useSelector((state) => state.fileUpload);

  // Use effect to simulate uploading process
  useEffect(() => {
    if (isStartVerification) {
      const interval = setInterval(() => {
        if (progress < 100) {
          dispatch(updateProgress(progress + 0.5)); // Increment progress by 1
        } else {
          clearInterval(interval); // Stop the interval when progress reaches 100
        }
      }, 100); // Update progress every 100ms

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [isStartVerification, progress, dispatch]);

  return (
    <Box sx={{ p: 3, pt: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="overline">
          {isStartVerification ? 'Processing' : 'Uploading'}
        </Typography>
        <Typography variant="subtitle1">{`${progress.toFixed(2)}%`}</Typography>
      </Box>

      <LinearProgress
        color={isStartVerification ? 'success' : 'warning'}
        variant="determinate"
        value={progress}
        sx={{
          width: 1,
          height: 8,
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
          [`& .${linearProgressClasses.bar}`]: { opacity: 0.8 },
        }}
      />
    </Box>
  );
}
