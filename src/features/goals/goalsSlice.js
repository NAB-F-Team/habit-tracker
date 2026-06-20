import { createSlice } from "@reduxjs/toolkit";
import goals from "../../data/goals.json";

const initialState = {
  list: goals,
  goalsPage: 1,
  lastGoalNotification: null
};

const goalsSlice = createSlice({
  name: "goals",
  initialState,
  reducers: {
    addGoal: (state, action) => {
      state.list.push(action.payload);
    },
    updateGoal: (state, action) => {
      const index = state.list.findIndex((item) => item.id === action.payload.id);

      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteGoal: (state, action) => {
      state.list = state.list.filter((item) => item.id !== action.payload);
    },
    setGoalsPage: (state, action) => {
      state.goalsPage = action.payload;
    },
    setGoalNotification: (state, action) => {
      state.lastGoalNotification = action.payload;
    },
    clearGoalNotification: (state) => {
      state.lastGoalNotification = null;
    }
  }
});

export const { addGoal, updateGoal, deleteGoal, setGoalsPage, setGoalNotification, clearGoalNotification } = goalsSlice.actions;

export default goalsSlice.reducer;
