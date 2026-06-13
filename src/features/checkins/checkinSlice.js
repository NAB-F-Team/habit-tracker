import { createSlice } from "@reduxjs/toolkit";
import checkins from "../../data/checkins.json";

const initialState = {
  list: checkins
};

const checkinSlice = createSlice({
  name: "checkins",
  initialState,
  reducers: {
    addCheckin: (state, action) => {
      state.list.push(action.payload);
    },
    updateCheckin: (state, action) => {
      const index = state.list.findIndex((item) => item.id === action.payload.id);

      if (index !== -1) {
        state.list[index] = action.payload;
      }
    }
  }
});

export const { addCheckin, updateCheckin } = checkinSlice.actions;

export default checkinSlice.reducer;
