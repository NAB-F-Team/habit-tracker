import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showAddHabitModal: false
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setShowAddHabitModal: (state, action) => {
      state.showAddHabitModal = action.payload;
    }
  }
});

export const { setShowAddHabitModal } = uiSlice.actions;

export default uiSlice.reducer;
