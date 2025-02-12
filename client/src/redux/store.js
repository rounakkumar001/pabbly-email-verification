import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slice/user-slice';
import fileUploadReducer from './slice/upload-slice';
import emailVerificationReducer from './slice/email-verification-slice';

export const store = configureStore({
  reducer: {
    fileUpload: fileUploadReducer,
    user : userReducer,
    emailVerificationLogs : emailVerificationReducer
  },
});

export default store;
