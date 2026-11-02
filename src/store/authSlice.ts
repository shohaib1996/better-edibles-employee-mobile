import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Employee } from '@/types/api';

type AuthStatus = 'booting' | 'signedOut' | 'signedIn';

interface AuthState {
  status: AuthStatus;
  token: string | null;
  employee: Employee | null;
  /** A one-shot landing after fresh sign-in: drivers go to the Driving/HR choice. */
  landing: 'choice' | null;
}

const initialState: AuthState = { status: 'booting', token: null, employee: null, landing: null };

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
      state.landing = action.payload.employee.isDriver ? 'choice' : null;
    },
    employeeLoaded(state, action: PayloadAction<Employee>) {
      state.employee = action.payload;
      state.status = 'signedIn';
    },
    // Restored a saved token but couldn't load "me" (offline / server error):
    // enter the app anyway rather than forcing a re-login. Only a 401 signs out.
    sessionResumed(state) {
      state.status = 'signedIn';
    },
    landingConsumed(state) {
      state.landing = null;
    },
    signedOut() {
      return { ...initialState, status: 'signedOut' as const };
    },
  },
});

export const { tokenRestored, signedIn, employeeLoaded, sessionResumed, landingConsumed, signedOut } = authSlice.actions;
export default authSlice.reducer;
