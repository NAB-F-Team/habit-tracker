import { format, differenceInDays } from "date-fns";

const PRIORITY_ORDER = {
  High: 3,
  Medium: 2,
  Low: 1
};

function getDateKey(value) {
  return value ? format(new Date(value), "yyyy-MM-dd") : null;
}

export function getHabitStatusOnDate(habit, selectedDate) {
  if (habit.status === "Archived") {
    const archivedDate = getDateKey(habit.archivedAt);
    if (archivedDate && selectedDate >= archivedDate) {
      return "Archived";
    }
  }
  if (habit.status === "Paused") {
    const pausedDate = getDateKey(habit.pausedAt);
    if (pausedDate && selectedDate === pausedDate) {
      return "Paused";
    }
  }
  return "Active";
}

export function getActiveDaysDifference(habit, dateA, dateB) {
  const dRefA = new Date(dateA);
  const dRefB = new Date(dateB);
  const diffCalendar = differenceInDays(dRefA, dRefB);
  
  const pausedDate = getDateKey(habit.pausedAt);
  if (pausedDate) {
    if (pausedDate > dateB && pausedDate <= dateA) {
      return Math.max(0, diffCalendar - 1);
    }
  }
  return diffCalendar;
}

function wasHabitTrackableOnDate(habit, selectedDate, hasCheckin) {
  if (hasCheckin) return true;

  const createdDate = getDateKey(habit.createdAt);
  if (createdDate && selectedDate < createdDate) return false;

  const archivedDate = getDateKey(habit.archivedAt);
  if (archivedDate && selectedDate >= archivedDate) return false;

  const pausedDate = getDateKey(habit.pausedAt);
  if (pausedDate && selectedDate === pausedDate) return false;

  if (habit.frequency === "Specific days" && Array.isArray(habit.daysOfWeek)) {
    const dateObj = new Date(`${selectedDate}T00:00:00`);
    const dayOfWeek = dateObj.getDay();
    if (!habit.daysOfWeek.includes(dayOfWeek)) return false;
  }

  return true;
}

function sortHabitsForDailyCheckin(a, b) {
  const priorityDifference = (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
  if (priorityDifference !== 0) return priorityDifference;

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function calculateHabitStats(habit, checkins) {
  const habitId = habit.id;
  const habitCheckIns = checkins.filter((c) => c.habitId === habitId && c.status === "Completed").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (habitCheckIns.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0
    };
  }
  const totalCompletions = habitCheckIns.length;
  
  let currentStreak = 0;
  if (habit.status !== "Archived") {
    const today = format(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
    const sortedDates2 = habitCheckIns.map((c) => c.date).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const mostRecentDate = sortedDates2[0];
    const activeDaysToToday = getActiveDaysDifference(habit, today, mostRecentDate);
    const isStreakActive = activeDaysToToday <= 1;
    
    if (isStreakActive) {
      let currentDate = sortedDates2[0];
      currentStreak = 1;
      for (let i = 1; i < sortedDates2.length; i++) {
        const prevDate = sortedDates2[i];
        const activeDaysDiff = getActiveDaysDifference(habit, currentDate, prevDate);
        if (activeDaysDiff === 1) {
          currentStreak++;
          currentDate = prevDate;
        } else {
          break;
        }
      }
    }
  }

  let longestStreak = 0;
  let tempStreak = 1;
  const sortedDates = habitCheckIns.map((c) => c.date).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  for (let i = 1; i < sortedDates.length; i++) {
    const activeDaysDiff = getActiveDaysDifference(habit, sortedDates[i - 1], sortedDates[i]);
    if (activeDaysDiff === 1) {
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
  const stats = calculateHabitStats(habit, checkIns);
  const current = goal.targetType === "Streak" ? stats.currentStreak : stats.totalCompletions;
  const progress = Math.min((current / goal.targetValue) * 100, 100);

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
    .map((habit) => {
      const checkin = selectedDateCheckins.find((item) => item.habitId === habit.id);

      return {
        habit,
        checkin
      };
    })
    .filter(({ habit, checkin }) => wasHabitTrackableOnDate(habit, selectedDate, Boolean(checkin)))
    .sort((a, b) => sortHabitsForDailyCheckin(a.habit, b.habit));

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
