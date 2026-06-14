import { createSlice } from "@reduxjs/toolkit";
import { seedData } from "../../data/seedData";

const initialState = {
  list: seedData.goals
};

const goalSlice = createSlice({
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
    }
  }
});

export const {
  addGoal,
  updateGoal,
  deleteGoal
} = goalSlice.actions;

export default goalSlice.reducer;
