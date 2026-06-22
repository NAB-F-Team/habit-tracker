import { format, subDays } from "date-fns";

// Helper functions for data transformation
export const getHabitTarget = (habit) => Number(habit.targetPerDay || habit.target || 1);

export const getCheckinValue = (checkin) => Number(checkin.completedCount || checkin.completed || 0);

export const isCompleted = (habit, checkin) => getCheckinValue(checkin) >= getHabitTarget(habit);

export const getDateKey = (date) => format(date, "yyyy-MM-dd");

// Group checkins by habit ID
export function groupByHabit(checkins) {
  return checkins.reduce((groups, checkin) => {
    if (!groups[checkin.habitId]) {
      groups[checkin.habitId] = [];
    }

    groups[checkin.habitId].push(checkin);
    return groups;
  }, {});
}

export function getActiveDaysDifference(habit, dateA, dateB) {
  const dA = new Date(`${dateA}T00:00:00`);
  const dB = new Date(`${dateB}T00:00:00`);
  const diffCalendar = Math.round((dA - dB) / 86400000);

  const pausedDate = habit.pausedAt ? format(new Date(habit.pausedAt), "yyyy-MM-dd") : null;
  if (pausedDate) {
    if (pausedDate > dateB && pausedDate <= dateA) {
      return Math.max(0, diffCalendar - 1);
    }
  }
  return diffCalendar;
}

// Calculate streak statistics for a habit
export function getStreakStats(habit, checkins) {
  const completedDates = [...new Set(checkins.filter((checkin) => isCompleted(habit, checkin)).map((checkin) => checkin.date))].sort();

  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompletions: 0 };
  }

  let longestStreak = 1;
  let currentRun = 1;

  for (let index = 1; index < completedDates.length; index += 1) {
    const previous = completedDates[index - 1];
    const current = completedDates[index];
    const dayDifference = getActiveDaysDifference(habit, current, previous);

    currentRun = dayDifference === 1 ? currentRun + 1 : 1;
    longestStreak = Math.max(longestStreak, currentRun);
  }

  let currentStreak = 0;
  if (habit.status !== "Archived") {
    const today = format(new Date(), "yyyy-MM-dd");
    const mostRecentDate = completedDates[completedDates.length - 1];
    const activeDaysToToday = getActiveDaysDifference(habit, today, mostRecentDate);
    const isStreakActive = activeDaysToToday <= 1;

    if (isStreakActive) {
      currentStreak = 1;
      for (let index = completedDates.length - 1; index > 0; index -= 1) {
        const previous = completedDates[index - 1];
        const current = completedDates[index];
        const dayDifference = getActiveDaysDifference(habit, current, previous);

        if (dayDifference !== 1) {
          break;
        }

        currentStreak += 1;
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalCompletions: completedDates.length
  };
}

// Calculate 7-day completion rate for a habit
export function getSevenDayCompletionRate(habit, checkins) {
  const sevenDayKeys = new Set(Array.from({ length: 7 }, (_, index) => getDateKey(subDays(new Date(), index))));
  const recentCheckins = checkins.filter((checkin) => sevenDayKeys.has(checkin.date));

  if (recentCheckins.length === 0) {
    return 0;
  }

  const completedCount = recentCheckins.filter((checkin) => isCompleted(habit, checkin)).length;
  return Math.round((completedCount / recentCheckins.length) * 100);
}

// Get category distribution
export function getCategoryDistribution(habits) {
  const counts = habits.reduce((result, habit) => {
    const category = habit.category || "Other";
    result[category] = (result[category] || 0) + 1;
    return result;
  }, {});

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// Get activity data for heatmap
export function getActivityData(checkins) {
  const countsByDate = checkins.reduce((counts, checkin) => {
    counts[checkin.date] = (counts[checkin.date] || 0) + 1;
    return counts;
  }, {});

  return Object.entries(countsByDate).map(([date, count]) => ({ date, count }));
}

// Main aggregation function that computes all statistics
export function getStatisticsPageData(habits, checkins) {
  const activeHabits = habits.filter((habit) => habit.status === "Active");
  const activeHabitIds = new Set(activeHabits.map((habit) => habit.id));
  const checkinsByHabit = groupByHabit(checkins);
  const todayKey = getDateKey(new Date());
  const todayCheckins = checkins.filter((checkin) => checkin.date === todayKey && activeHabitIds.has(checkin.habitId));
  const todayCompleted = todayCheckins.filter((checkin) => {
    const habit = habits.find((item) => item.id === checkin.habitId);
    return habit && isCompleted(habit, checkin);
  }).length;

  const completedTodayPercent = activeHabits.length > 0 ? Math.round((todayCompleted / activeHabits.length) * 100) : 0;
  // Category distribution should include all habits regardless of status
  const categories = getCategoryDistribution(habits);
  const atRiskCount = activeHabits.filter((habit) => getStreakStats(habit, checkinsByHabit[habit.id] || []).currentStreak < 3).length;

  return {
    activeHabits,
    allHabits: habits,
    checkinsByHabit,
    completedTodayPercent,
    categories,
    atRiskCount,
    activityData: getActivityData(checkins)
  };
}
