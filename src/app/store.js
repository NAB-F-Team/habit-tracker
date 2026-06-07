import { configureStore } from "@reduxjs/toolkit";
import habitReducer from "../features/habits/habitSlice";
import checkinReducer from "../features/checkins/checkinSlice";

export const store = configureStore({
    reducer: {
        habits: habitReducer,
        checkins: checkinReducer
    }
});