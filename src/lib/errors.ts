import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import type { ApiErrorBody } from '@/types/api';

type AnyError = FetchBaseQueryError | SerializedError | undefined | unknown;

/** A short, human message for any RTK Query or thrown error. */
export function errorMessage(e: AnyError, fallback = 'Something went wrong.'): string {
  if (!e) return '';
  if (typeof e === 'object' && e !== null && 'status' in e) {
    const err = e as FetchBaseQueryError;
    if (err.status === 'FETCH_ERROR') return 'No connection. Check your internet and try again.';
    if (err.status === 503) return 'The server is busy. Try again shortly.';
    const body = err.data as ApiErrorBody | undefined;
    return body?.message || body?.error || fallback;
  }
  if (e instanceof Error) return e.message;
  if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as SerializedError).message === 'string') return (e as SerializedError).message!;
  return fallback;
}

/** True when the time clock asks the employee to type their PIN. */
export const isPinRequired = (e: AnyError) =>
  typeof e === 'object' && e !== null && 'data' in e && (e as { data?: ApiErrorBody }).data?.code === 'PIN_REQUIRED';
