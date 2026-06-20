import { createSelector } from "@reduxjs/toolkit";

export const getOverallStats = createSelector(

    [
        state => state.habits.list,
        state => state.checkins.list
    ],

    (habits, checkins) => {

        const activeHabits =
            habits.filter(
                h => h.status === "Active"
            );

        const totalCompleted =
            checkins.reduce(
                (sum, item) => sum + (item.completedCount ?? 0),
                0
            );

        return {
            activeHabits: activeHabits.length,
            totalCompleted
        };

    });
