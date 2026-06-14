import { createSlice } from "@reduxjs/toolkit";
import { seedData } from "../../data/seedData";

const initialState = {
  list: seedData.checkins,
  lastAction: null
};

const checkinSlice = createSlice({
  name: "checkins",
  initialState,
  reducers: {
    addCheckin: (state, action) => {
      state.list.push(action.payload);
      state.lastAction = {
        type: "add",
        checkin: action.payload
      };
    },

    updateCheckin: (state, action) => {
      const index = state.list.findIndex((item) => item.id === action.payload.id);

      if (index !== -1) {
        state.list[index] = action.payload;
        state.lastAction = {
          type: "update",
          checkin: action.payload
        };
      }
    },

    deleteCheckin: (state, action) => {
      const deletedCheckin = state.list.find((item) => item.id === action.payload);

      state.list = state.list.filter((item) => item.id !== action.payload);
      state.lastAction = {
        type: "delete",
        checkin: deletedCheckin
      };
    }
  }
});

export const {
  addCheckin,
  updateCheckin,
  deleteCheckin
} = checkinSlice.actions;

export default checkinSlice.reducer;
