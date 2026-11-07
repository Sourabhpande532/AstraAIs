import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../lib/api';
import type { RootState } from './store';

interface DashboardState {
  leaves: any[];
  meetings: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DashboardState = {
  leaves: [],
  meetings: [],
  status: 'idle',
  error: null,
};

const getAuthHeaders = (state: RootState) => ({
  headers: { Authorization: `Bearer ${state.auth.user?.token}` }
});

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await api.get('/api/hr/dashboard', getAuthHeaders(getState() as RootState));
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Unable to load dashboard data right now. Please try again.'
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    addLocalLeave: (state, action: PayloadAction<any>) => {
      state.leaves = [action.payload, ...state.leaves];
    },
    addLocalMeeting: (state, action: PayloadAction<any>) => {
      state.meetings = [...state.meetings, action.payload].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.leaves = Array.isArray(action.payload?.leaves) ? action.payload.leaves : [];
        state.meetings = Array.isArray(action.payload?.meetings) ? action.payload.meetings : [];
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || action.error.message || 'Failed to load dashboard data.';
      });
  },
});

export const { addLocalLeave, addLocalMeeting } = dashboardSlice.actions;
export default dashboardSlice.reducer;
