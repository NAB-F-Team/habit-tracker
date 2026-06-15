import { createSlice } from "@reduxjs/toolkit";
import goals from "../../data/goals.json";

const initialState = {
  list: goals,
  goalsPage: 1
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
    }
  }
});

export const { addGoal, updateGoal, deleteGoal, setGoalsPage } = goalsSlice.actions;

export default goalsSlice.reducer;
