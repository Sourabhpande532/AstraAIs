import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface User {
  _id: string;
  name: string;
  email: string;
  isGuest: boolean;
  leaveBalance: { sick: number; casual: number; earned: number };
  token: string;
}

interface AuthState {
  user: User | null;
}

const loadStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.token) {
      return parsed as User;
    }
    return null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const initialState: AuthState = {
  user: loadStoredUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    updateLeaveBalance: (
      state,
      action: PayloadAction<{ type: 'sick' | 'casual' | 'earned'; remainingBalance: number }>
    ) => {
      if (state.user && state.user.leaveBalance) {
        state.user.leaveBalance[action.payload.type] = action.payload.remainingBalance;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder.addCase('dashboard/fetchData/fulfilled', (state, action: any) => {
      if (state.user && action.payload?.user?.leaveBalance) {
        state.user.leaveBalance = action.payload.user.leaveBalance;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    });
  },
});

export const { setCredentials, updateLeaveBalance, logout } = authSlice.actions;
export default authSlice.reducer;
