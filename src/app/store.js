import { configureStore } from "@reduxjs/toolkit";
import habitReducer from "../features/habits/habitSlice";
import checkinReducer from "../features/checkins/checkinSlice";
import goalReducer from "../features/goals/goalSlice";
import { loadState, saveState } from "../services/localStorageService";

export const store = configureStore({
    reducer: {
        habits: habitReducer,
        checkins: checkinReducer,
        goals: goalReducer
    },
    preloadedState: loadState()
});

store.subscribe(() => {
    saveState(store.getState());
});
