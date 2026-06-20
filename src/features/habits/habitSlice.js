import { createSlice } from "@reduxjs/toolkit";
import { seedData } from "../../data/seedData";

const initialState = {
    list: seedData.habits,
    filters: {
        category: "",
        priority: "",
        status: "",
        frequency: "",
    },
    lastAction: null
};

const habitSlice = createSlice({
    name: "habits",
    initialState,

    reducers: {

        addHabit: (state, action) => {
            const payload = action.payload;
            if (payload.habit) {
                const { undoId, habit } = payload;
                state.list.push(habit);
                state.lastAction = undoId ? { undoId, type: "add", habitId: habit.id, previousHabit: null } : null;
            } else {
                state.list.push(payload);
                state.lastAction = null;
            }
        },

        updateHabit: (state, action) => {
            const payload = action.payload;
            const habit = payload.habit || payload;
            const undoId = payload.undoId;

            const index = state.list.findIndex(
                item => item.id === habit.id
            );

            if (index !== -1) {
                const previousHabit = { ...state.list[index] };
                state.list[index] = habit;
                state.lastAction = undoId ? { undoId, type: "update", habitId: habit.id, previousHabit } : null;
            }
        },

        deleteHabit: (state, action) => {
            const payload = action.payload;
            const habitId = payload.habitId || payload;
            const undoId = payload.undoId;

            const index = state.list.findIndex(
                item => item.id === habitId
            );

            if (index !== -1) {
                const previousHabit = { ...state.list[index] };
                state.list =
                    state.list.filter(
                        item => item.id !== habitId
                    );
                state.lastAction = undoId ? { undoId, type: "delete", habitId, previousHabit } : null;
            }
        },

        undoLastHabitAction: (state, action) => {
            const undoId = action.payload;

            if (!state.lastAction || state.lastAction.undoId !== undoId) {
                return;
            }

            const { type, habitId, previousHabit } = state.lastAction;

            if (type === "delete") {
                if (previousHabit) {
                    state.list.push(previousHabit);
                }
            } else if (type === "update") {
                if (previousHabit) {
                    const index = state.list.findIndex(item => item.id === habitId);
                    if (index !== -1) {
                        state.list[index] = previousHabit;
                    }
                }
            } else if (type === "add") {
                state.list = state.list.filter(item => item.id !== habitId);
            }

            state.lastAction = null;
        },

        setFilter: (state, action) => {
            state.filters = {
                ...state.filters,
                ...action.payload
            };
        }

    }
});

export const {
    addHabit,
    updateHabit,
    deleteHabit,
    undoLastHabitAction,
    setFilter
} = habitSlice.actions;

export default habitSlice.reducer;
