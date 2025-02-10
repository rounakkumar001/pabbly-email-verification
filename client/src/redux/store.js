import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slice/userSlice';
import fileUploadReducer from './slice/upload-slice';
import emailVerificationReducer from './slice/emailVerificationSlice';

export const store = configureStore({
  reducer: {
    fileUpload: fileUploadReducer,
    user : userReducer,
    emailVerificationLogs : emailVerificationReducer
  },
});

export default store;
