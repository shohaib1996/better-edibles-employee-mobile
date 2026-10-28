import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useDispatch, useSelector } from 'react-redux';
import authReducer from './authSlice';
import { employeeApi } from './api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(employeeApi.middleware),
});

// Refetch on reconnect / app focus where queries opt in.
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
