import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import axios, { endpoints } from "src/utils/axios";

const initialState = {
    status: 'idle',
    message: '',
    error: null,
    isLoading: false,
    verificationResults: [],
    filteredCSVLogs: [],
    selectedListName: '',
};

export const fetchEmailVerificationResults = createAsyncThunk(
    'email/fetchEmailVerificationResults',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(endpoints.bouncify.verificationLogs); // Use your endpoint to fetch 
            return response.data; // Return the entire response data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const singleEmailVerificationResults = createAsyncThunk(
    'email/singleEmailVerificationResults',
    async (email, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(endpoints.bouncify.verifySingleEmail, { email }); // Use your endpoint to fetch
            const logEntry = response.data.data;
            dispatch(addSingleVerificationResult(logEntry));
            return response.data; // Return the entire response data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteBulkEmailList = createAsyncThunk(
    'emailVerification/deleteBulkEmailList',
    async (jobId, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${endpoints.bouncify.deleteEmailList}?job_id=${jobId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response ? error.response.data : error.message);
        }
    }
);

const emailVerificationSlice = createSlice({
    name: 'emailVerification',
    initialState,
    reducers: {
        clearVerificationResults(state) {
            state.verificationResults = [];
        },
        addSingleVerificationResult: (state, action) => { 
            state.verificationResults.unshift(action.payload); 
        },
        setSelectedListName: (state, action) => {
            state.selectedListName = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchEmailVerificationResults.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.status = 'fetching...';
        });
        builder.addCase(fetchEmailVerificationResults.fulfilled, (state, action) => {
            const { status, message, data } = action.payload;
            state.verificationResults = data; 
            state.message = message; 
            state.status = status;
            state.isLoading = false;
            state.filteredCSVLogs = data
                .filter(item => item.source_type === "CSV")
                .map(item => ({
                    status: item.status,
                    name: item.source_name,
                    numberOfEmails: item.total_emails,
                    date: convertDateFormat(item.created_at),
                    jobId: item.job_id,
                    _id : item.user_id
                }));
        });
        builder.addCase(fetchEmailVerificationResults.rejected, (state, action) => {
            state.error = action.payload || action.error.message;
            state.isLoading = false;
            state.status = 'rejected';
        });
        builder.addCase(deleteBulkEmailList.pending, (state) => {
            state.isLoading = true; 
            state.error = null;
            state.status = 'deleting'; 
        });
        builder.addCase(deleteBulkEmailList.fulfilled, (state, action) => {
            state.isLoading = false; 
            state.status = 'deleted'; 
            const deletedJobId = action.meta.arg;
            state.filteredCSVLogs = state.filteredCSVLogs.filter(item => item.jobId !== deletedJobId);
            state.verificationResults = state.verificationResults.filter(item => item.job_id !== deletedJobId);
        });
        builder.addCase(deleteBulkEmailList.rejected, (state, action) => {
            state.isLoading = false; 
            state.status = 'deletion failed';
            state.error = action.payload.message || "Failed to delete";
            console.error("Delete request rejected with error:", action.payload);
        });
    },
});

function convertDateFormat(isoString) {
    try {
        const date = new Date(isoString);
        const options = {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        };
        const formattedDate = date.toLocaleDateString('en-US', options).replace(/,([^ ]|$)/, '$1');
        return formattedDate;
    } catch (error) {
        return "Invalid date format";
    }
}

export const { clearVerificationResults, addSingleVerificationResult, setSelectedListName } = emailVerificationSlice.actions;

export default emailVerificationSlice.reducer;
