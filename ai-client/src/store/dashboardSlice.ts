import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';
import type { RootState } from './store';

interface DashboardState {
  leaves: any[];
  meetings: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: DashboardState = {
  leaves: [],
  meetings: [],
  status: 'idle',
};

const getAuthHeaders = (state: RootState) => ({
  headers: { Authorization: `Bearer ${state.auth.user?.token}` }
});

export const fetchDashboardData = createAsyncThunk('dashboard/fetchData', async (_, { getState }) => {
  const response = await api.get('/api/hr/dashboard', getAuthHeaders(getState() as RootState));
  return response.data;
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.leaves = action.payload.leaves;
        state.meetings = action.payload.meetings;
      })
      .addCase(fetchDashboardData.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default dashboardSlice.reducer;
