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
      const { undoId, checkin } = action.payload;

      state.list.push(checkin);
      state.lastAction = undoId
        ? {
            undoId,
            checkinId: checkin.id,
            previousCheckin: null
          }
        : null;
    },
    updateCheckin: (state, action) => {
      const { undoId, checkin } = action.payload;
      const index = state.list.findIndex((item) => item.id === checkin.id);

      if (index !== -1) {
        const previousCheckin = { ...state.list[index] };

        state.list[index] = checkin;
        state.lastAction = undoId
          ? {
              undoId,
              checkinId: checkin.id,
              previousCheckin
            }
          : null;
      }
    },
    undoLastCheckinAction: (state, action) => {
      const undoId = action.payload;

      if (!state.lastAction || state.lastAction.undoId !== undoId) {
        return;
      }

      const { checkinId, previousCheckin } = state.lastAction;

      if (previousCheckin) {
        const index = state.list.findIndex((item) => item.id === checkinId);

        if (index !== -1) {
          state.list[index] = previousCheckin;
        }
      } else {
        state.list = state.list.filter((item) => item.id !== checkinId);
      }

      state.lastAction = null;
    }
  }
});

export const { addCheckin, updateCheckin, undoLastCheckinAction } = checkinSlice.actions;

export default checkinSlice.reducer;
