import { configureStore, createSlice} from '@reduxjs/toolkit';
import navigationReducer from "./navigationSlice"; 
import myPillPalsReducer from "./myPillPalsSlice"; 
import AuthScreen from './Screens/AuthScreen';

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    myPillPals: myPillPalsReducer
  },
});


