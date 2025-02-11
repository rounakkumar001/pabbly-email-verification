import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios,{endpoints} from 'src/utils/axios';

export const uploadBulkEmail = createAsyncThunk(
  'fileUpload/uploadBulkEmail',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startUpload());
      const formData = new FormData();
      formData.append('csv_file', file);

      const response = await axios.post(endpoints.bouncify.uploadBulkEmail, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          dispatch(updateProgress(progress));
        },
      });

      dispatch(finishUpload(response.data)); 
      return response.data;

    } catch (error) {
      dispatch(resetUpload());
      return rejectWithValue(error.response?.data?.message || error.message || "An error occurred.");
    }
  }
);

export const startEmailVerification = createAsyncThunk(
    'fileUpload/startEmailVerification',
    async (jobId, { dispatch, rejectWithValue }) => {
        try {
            dispatch(startVerification());
            const verificationResponse = await axios.patch(`${endpoints.bouncify.startBulkEmailVerification}?job_id=${jobId}`);
            return verificationResponse.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || "An error occurred during verification.");
        }
    }
);

const fileUploadSlice = createSlice({
  name: 'fileUpload',
  initialState: {
    progress: 0,
    isUploading: false,
    isUploaded: false,
    uploadResponse: null,
    isStartVerification: false,
    isVerificationCompleted: false,
    jobId: null,
    error: null,
    success: false,
    message: null,
  },
  reducers: {
    startUpload(state) {
      state.isUploading = true;
      state.progress = 0;
      state.error = null;
      state.success = false;
      state.message = null;
    },
    updateProgress(state, action) {
      state.progress = action.payload;
    },
    finishUpload(state, action) {
      state.isUploading = false;
      state.isUploaded = true;
      state.progress = 100;
      state.uploadResponse = action.payload; 
      state.jobId = action.payload.data.job_id; 
    },
    startVerification(state) {
      state.isStartVerification = true;
      state.isVerificationCompleted = false; 
      state.progress = 0;
      state.error = null; 
      state.success = false;
      state.message = null;
    },
    completeVerification(state, action) {
      state.isStartVerification = false;
      state.isVerificationCompleted = true;
      state.progress = 100;
      state.success = true;
    },
    resetUpload(state) {
        state.isUploading = false;
        state.isUploaded = false;
        state.uploadResponse = null;
        state.isStartVerification = false;
        state.isVerificationCompleted = false;
        state.progress = 0;
        state.jobId = null;
        state.error = null;
        state.success = false;
        state.message = null;
    },
  },
    extraReducers: (builder) => {
        builder.addCase(uploadBulkEmail.rejected, (state, action) => {
            state.error = action.payload;
            state.success = false;
            state.message = null;
            state.jobId = null;
        }).addCase(startEmailVerification.rejected, (state, action) => {
            state.error = action.payload;
            state.success = false;
            state.message = null;
        });
    },
});

export const {
  startUpload,
  updateProgress,
  finishUpload,
  startVerification,
  completeVerification,
  resetUpload,
} = fileUploadSlice.actions;

export default fileUploadSlice.reducer;
