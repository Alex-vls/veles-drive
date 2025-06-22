import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from '@/services/api';
import authReducer from './slices/authSlice';
import carsReducer from './slices/carsSlice';
import companiesReducer from './slices/companiesSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';
import carReducer from './slices/carSlice';
import companyReducer from './slices/companySlice';
import reviewReducer from './slices/reviewSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    cars: carsReducer,
    companies: companiesReducer,
    ui: uiReducer,
    user: userReducer,
    car: carReducer,
    company: companyReducer,
    review: reviewReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 