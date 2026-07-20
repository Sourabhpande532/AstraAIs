import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
  _id: string;
  name: string;
  email: string;
  isGuest: boolean;
  leaveBalance: { sick: number, casual: number, earned: number };
  token: string;
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder.addCase('dashboard/fetchData/fulfilled', (state, action: any) => {
      if (state.user && action.payload.user?.leaveBalance) {
        state.user.leaveBalance = action.payload.user.leaveBalance;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
