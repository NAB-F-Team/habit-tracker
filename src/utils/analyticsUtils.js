import { format, differenceInDays } from "date-fns";

function calculateHabitStats(habitId, checkIns) {
  const habitCheckIns = checkIns.filter((c) => c.habitId === habitId && c.status === "Completed").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (habitCheckIns.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0
    };
  }
  const totalCompletions = habitCheckIns.length;
  let currentStreak = 0;
  const today = format(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
  const yesterday = format(new Date(Date.now() - 24 * 60 * 60 * 1e3), "yyyy-MM-dd");
  const hasRecentCheckIn = habitCheckIns.some((c) => c.date === today || c.date === yesterday);
  if (hasRecentCheckIn) {
    const sortedDates2 = habitCheckIns.map((c) => c.date).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let currentDate = sortedDates2[0];
    currentStreak = 1;
    for (let i = 1; i < sortedDates2.length; i++) {
      const prevDate = sortedDates2[i];
      const daysDiff = differenceInDays(new Date(currentDate), new Date(prevDate));
      if (daysDiff === 1) {
        currentStreak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
  }
  let longestStreak = 0;
  let tempStreak = 1;
  const sortedDates = habitCheckIns.map((c) => c.date).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = differenceInDays(new Date(sortedDates[i - 1]), new Date(sortedDates[i]));
    if (daysDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  return {
    currentStreak,
    longestStreak,
    totalCompletions
  };
}

export function getCheckinStatus(completedCount = 0, targetPerDay = 1) {
  if (completedCount <= 0) {
    return "Not Started";
  }

  return completedCount >= targetPerDay ? "Completed" : "In Progress";
}

export function getGoalProgress(goal, habit, checkIns) {
  const stats = calculateHabitStats(habit.id, checkIns);
  const current = goal.type === "Streak" ? stats.currentStreak : stats.totalCompletions;
  const progress = Math.min((current / goal.target) * 100, 100);

  let status = "On Track";
  if (progress >= 100) {
    status = "Achieved";
  } else if (progress >= 80) {
    status = "Nearing Completion";
  }

  return { goal, habit, current, progress, status, stats };
}

export function getDailyCompletionSummary(habits, checkins, selectedDate) {
  const selectedDateCheckins = checkins.filter((checkin) => checkin.date === selectedDate);

  const habitData = habits
    .filter((habit) => habit.status === "Active")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((habit) => {
      const checkin = selectedDateCheckins.find((item) => item.habitId === habit.id);

      return {
        habit,
        checkin
      };
    });

  const completedCount = habitData.filter(({ habit, checkin }) => {
    const status = checkin?.status ?? getCheckinStatus(checkin?.completedCount ?? 0, habit.targetPerDay);

    return status === "Completed";
  }).length;
  const totalCount = habitData.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    habitData,
    selectedDateCheckins,
    completedCount,
    totalCount,
    completionPercentage
  };
}
