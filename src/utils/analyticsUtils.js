export function getCheckinStatus(completedCount = 0, targetPerDay = 1) {
  if (completedCount <= 0) {
    return "Not Started";
  }

  return completedCount >= targetPerDay ? "Completed" : "In Progress";
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
