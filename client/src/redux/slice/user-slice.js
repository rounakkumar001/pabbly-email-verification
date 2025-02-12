import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import axios, { endpoints } from "src/utils/axios";

const initialState = {
    user: null,
    state: 'idle',
    error: null,
    timezoneStatus: 'idle',
    timezoneError: null,
    message: '', 
    isLoading: false,
    credits: {
        allotted: 0,
        consumed: 0,
        remaining: 0,
    },
};

export const fetchUserSession = createAsyncThunk(
    'auth/fetchUserSession',
    async (_, { rejectWithValue }) => {
        try{
            const response = await axios.get(endpoints.auth.me);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
)

export const updateUserTimezone = createAsyncThunk(
    'user/updateTimezone',
    async (timezone, { rejectWithValue }) => {
        try {
            const response = await axios.post(endpoints.user.timezone, { timezone }); 
            return response.data; 
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchUserCredits = createAsyncThunk(
    'user/fetchUserCredits',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(endpoints.bouncify.credits);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const userSlice = createSlice({
    name : 'user',
    initialState,
    reducers : {
        logout : (state) => {
            state.user = null;
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers : (builder) => {
        builder
        .addCase(fetchUserSession.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(fetchUserSession.fulfilled, (state, action) => {
            const userData = action.payload.data;
            state.user = {
                ...userData,
                displayName : `${userData.first_name} ${userData.last_name}`
            };
            state.state = 'authenticated';
        })
        .addCase(fetchUserSession.rejected, (state, action) => {
            state.user = null;
            state.status = 'unauthenticated';
            state.error = action.payload || action.error.message;
        })
        .addCase(updateUserTimezone.pending, (state) => {
            state.timezoneStatus = 'loading';
            state.timezoneError = null;
        })
        .addCase(updateUserTimezone.fulfilled, (state, action) => {
            if (state.user) {
              state.user.time_zone = action.payload.data.timezone;
            }
            state.timezoneStatus = 'success';
        })
        .addCase(updateUserTimezone.rejected, (state, action) => {
            state.timezoneStatus = 'error';
            state.timezoneError = action.payload || action.error.message;
        })
        .addCase(fetchUserCredits.pending, (state) => {
            state.isLoading = true;
            state.credits.error = null;
            state.status = 'fetching credits...';
        })
        .addCase(fetchUserCredits.fulfilled, (state, action) => {
            const creditsData = action.payload;
            state.credits = {
                allotted: creditsData.credits_allotted || 0,
                consumed: creditsData.credits_consumed || 0,
                remaining: creditsData.credits_remaining || 0,
            };
            state.status = 'success';
            state.isLoading = false;
        })
        .addCase(fetchUserCredits.rejected, (state, action) => {
            state.credits.error = action.payload || action.error?.message;
            state.isLoading = false;
            state.status = 'credits fetch failed';
            state.credits = { allotted: 0, consumed: 0, remaining: 0};
        })
    }
})

export const {logout} = userSlice.actions;
export default userSlice.reducer;
