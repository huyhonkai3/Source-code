import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

// Factory function để khởi tạo store với preloadedState
export const createAppStore = (preloadedState) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });
};

// Export default store instance
const store = createAppStore(undefined);
export default store;
