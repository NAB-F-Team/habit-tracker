import { configureStore } from "@reduxjs/toolkit";
import habitReducer from "../features/habits/habitSlice";
import checkinReducer from "../features/checkins/checkinSlice";
import goalReducer from "../features/goals/goalsSlice";
import uiReducer from "../features/ui/uiSlice";

export const store = configureStore({
    reducer: {
        habits: habitReducer,
        checkins: checkinReducer,
        goals: goalReducer,
        ui: uiReducer
    }
});
