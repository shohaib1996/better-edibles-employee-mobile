import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Employee } from '@/types/api';

type AuthStatus = 'booting' | 'signedOut' | 'signedIn';
export type WorkMode = 'driving' | 'hr';

interface AuthState {
  status: AuthStatus;
  token: string | null;
  employee: Employee | null;
  /** A one-shot landing on sign-in and app open: drivers go to the Driving/HR choice. */
  landing: 'choice' | null;
  /** Which side of the app is showing. Driving is route only; HR never shows the route. */
  mode: WorkMode;
}

const initialState: AuthState = { status: 'booting', token: null, employee: null, landing: null, mode: 'hr' };

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
      state.landing = action.payload.isDriver ? 'choice' : null;
    },
    // Restored a saved token but couldn't load "me" (offline / server error):
    // enter the app anyway rather than forcing a re-login. Only a 401 signs out.
    sessionResumed(state) {
      state.status = 'signedIn';
    },
    landingConsumed(state) {
      state.landing = null;
    },
    modeChosen(state, action: PayloadAction<WorkMode>) {
      state.mode = action.payload;
    },
    signedOut() {
      return { ...initialState, status: 'signedOut' as const };
    },
  },
});

export const { tokenRestored, signedIn, employeeLoaded, sessionResumed, landingConsumed, modeChosen, signedOut } = authSlice.actions;
export default authSlice.reducer;
