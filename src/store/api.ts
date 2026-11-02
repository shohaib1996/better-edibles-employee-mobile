import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/lib/config';
import { tokenStorage } from '@/lib/tokenStorage';
import type {
  ClockAction, ClockState, Employee, HrDoc, LocationSnapshot, MeResponse, PayHistory, PayRun, Stop, Transcription, WeekSummary,
} from '@/types/api';
import { signedOut } from './authSlice';
import type { RootState } from './index';

// Talks to the Better Edibles backend only, never to Accounting directly.
// The backend works out "me" from the signed JWT, so no employee id is ever sent.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// An expired or revoked token signs the employee out everywhere at once.
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra);
  if (result.error?.status === 401 && (api.getState() as RootState).auth.token) {
    await tokenStorage.clear();
    api.dispatch(signedOut());
    api.dispatch(employeeApi.util.resetApiState());
  }
  return result;
};

type RawClock = {
  attendance: Pick<ClockState, 'status' | 'clockInAt' | 'mealOutAt' | 'mealInAt'>;
  mobileActions: Pick<ClockState, 'canClockIn' | 'canClockOut' | 'canMealOut' | 'canMealIn'>;
};
const toClock = (r: RawClock): ClockState => ({ ...r.attendance, ...r.mobileActions });
const me = (path = '') => `/api/employee-app/me${path}`;

export const employeeApi = createApi({
  reducerPath: 'employeeApi',
  baseQuery,
  tagTypes: ['Me', 'Clock', 'Week', 'Pay', 'Docs', 'Route'],
  endpoints: (b) => ({
    login: b.mutation<{ token: string; employee: Employee }, { loginName: string; password: string }>({
      query: ({ loginName, password }) => ({ url: '/api/employee-auth/login', method: 'POST', body: { email: loginName, password } }),
      transformResponse: (r: { token: string; employee: { _id: string; name: string; employeeType: string; isDriver?: boolean } }, _m, arg) => ({
        token: r.token,
        employee: { id: r.employee._id, name: r.employee.name, email: arg.loginName.includes('@') ? arg.loginName : null, employeeType: r.employee.employeeType, isDriver: !!r.employee.isDriver },
      }),
    }),
    requestPasswordReset: b.mutation<string, string>({
      query: (email) => ({ url: '/api/employee-auth/request-reset', method: 'POST', body: { email } }),
      transformResponse: (r: { message: string }) => r.message,
    }),

    getMe: b.query<MeResponse, void>({ query: () => me(), providesTags: ['Me'] }),

    getClockState: b.query<ClockState, void>({ query: () => me('/timeclock/state'), transformResponse: toClock, providesTags: ['Clock'] }),
    punch: b.mutation<ClockState, { action: ClockAction; location?: LocationSnapshot; pin?: string }>({
      query: ({ action, ...body }) => ({ url: me(`/timeclock/${action}`), method: 'POST', body }),
      transformResponse: toClock,
      // Write the official state straight into the cache; refresh hours.
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(employeeApi.util.upsertQueryData('getClockState', undefined, data));
          dispatch(employeeApi.util.invalidateTags(['Week']));
        } catch {
          dispatch(employeeApi.util.invalidateTags(['Clock'])); // show the official state, never guess
        }
      },
    }),

    getWeek: b.query<WeekSummary, string | void>({
      query: (payPeriodStart) => me(`/week${payPeriodStart ? `?payPeriodStart=${payPeriodStart}` : ''}`),
      providesTags: ['Week'],
    }),
    getPayHistory: b.query<PayHistory, void>({ query: () => me('/pay-runs'), providesTags: ['Pay'] }),
    getPayRun: b.query<PayRun, string>({
      query: (payPeriodStart) => me(`/pay-runs/${payPeriodStart}`),
      transformResponse: (r: { run: PayRun }) => r.run,
      providesTags: ['Pay'],
    }),

    listDocs: b.query<HrDoc[], void>({ query: () => me('/documents'), transformResponse: (r: { documents: HrDoc[] }) => r.documents, providesTags: ['Docs'] }),
    deleteDoc: b.mutation<{ success: boolean; message: string }, string>({
      query: (slug) => ({ url: me(`/documents/${encodeURIComponent(slug)}`), method: 'DELETE' }),
      invalidatesTags: ['Docs'],
    }),

    getRoute: b.query<Stop[], string | void>({
      query: (date) => me(`/route${date ? `?date=${date}` : ''}`),
      transformResponse: (r: { stops: Stop[] }) => r.stops,
      providesTags: ['Route'],
    }),
    markArrived: b.mutation<void, string>({ query: (id) => ({ url: me(`/route/${id}/arrived`), method: 'POST' }), invalidatesTags: ['Route'] }),
    transcribe: b.mutation<Transcription, { uri: string; mimeType: string; name: string }>({
      query: ({ uri, mimeType, name }) => {
        const form = new FormData();
        // React Native's fetch uploads a local file from this { uri, name, type } object.
        form.append('audio', { uri, name, type: mimeType } as unknown as Blob);
        return { url: '/api/voice-note/transcribe', method: 'POST', body: form };
      },
      transformResponse: (r: { transcript?: string; summary?: string }) => ({ transcript: r.transcript ?? '', summary: r.summary ?? r.transcript ?? '' }),
    }),
    saveVoiceNote: b.mutation<void, { stopId: string; note: string; transcript?: string }>({
      // The driver-only route: the backend checks the stop is on this driver's route.
      query: ({ stopId, note, transcript }) => ({ url: me(`/route/${stopId}/note`), method: 'POST', body: { note, transcript } }),
      invalidatesTags: ['Route'],
    }),
  }),
});

export const {
  useLoginMutation, useRequestPasswordResetMutation, useGetMeQuery, useGetClockStateQuery, usePunchMutation,
  useGetWeekQuery, useGetPayHistoryQuery, useGetPayRunQuery, useListDocsQuery, useDeleteDocMutation, useGetRouteQuery,
  useMarkArrivedMutation, useTranscribeMutation, useSaveVoiceNoteMutation,
} = employeeApi;
