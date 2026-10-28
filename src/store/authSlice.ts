import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Employee } from '@/types/api';

type AuthStatus = 'booting' | 'signedOut' | 'signedIn';

interface AuthState {
  status: AuthStatus;
  token: string | null;
  employee: Employee | null;
}

const initialState: AuthState = { status: 'booting', token: null, employee: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    tokenRestored(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      if (!action.payload) state.status = 'signedOut';
    },
    signedIn(state, action: PayloadAction<{ token: string; employee: Employee }>) {
      state.token = action.payload.token;
      state.employee = action.payload.employee;
      state.status = 'signedIn';
    },
    employeeLoaded(state, action: PayloadAction<Employee>) {
      state.employee = action.payload;
      state.status = 'signedIn';
    },
    signedOut() {
      return { ...initialState, status: 'signedOut' as const };
    },
  },
});

export const { tokenRestored, signedIn, employeeLoaded, signedOut } = authSlice.actions;
export default authSlice.reducer;
