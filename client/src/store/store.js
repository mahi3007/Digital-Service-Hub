import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import serviceReducer from './slices/serviceSlice';
import bookingReducer from './slices/bookingSlice';
import rfqReducer from './slices/rfqSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    service: serviceReducer,
    booking: bookingReducer,
    rfq: rfqReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
