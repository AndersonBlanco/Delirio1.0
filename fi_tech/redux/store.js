import { configureStore, createSlice} from '@reduxjs/toolkit';
import navigationReducer from "./navigationSlice"; 

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
  },
});


