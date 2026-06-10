import { useMemo } from "react";
import { format, subDays, startOfWeek, addDays, getMonth } from "date-fns";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarHeatmap({ data, maxValue }) {
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const numWeeks = 52;
    const weeksArray = [];
    const monthLabelsArray = [];
    const startDate = subDays(today, numWeeks * 7);
    const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });
    let lastMonth = -1;

    for (let weekIndex = 0; weekIndex < numWeeks; weekIndex++) {
      const week = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const currentDate = addDays(weekStart, weekIndex * 7 + dayIndex);
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const dataPoint = data.find((item) => item.date === dateStr);
        const currentMonth = getMonth(currentDate);

        if (currentMonth !== lastMonth && dayIndex === 0) {
          monthLabelsArray.push({
            month: format(currentDate, "MMM"),
            startWeek: weekIndex
          });
          lastMonth = currentMonth;
        }

        week.push({
          date: currentDate,
          count: dataPoint?.count || 0
        });
      }
      weeksArray.push(week);
    }

    return { weeks: weeksArray, monthLabels: monthLabelsArray };
  }, [data]);

  const max = maxValue || Math.max(...data.map((item) => item.count), 1);

  const getColor = (count) => {
    if (count === 0) return "bg-muted";
    const intensity = count / max;
    if (intensity >= 0.75) return "bg-primary";
    if (intensity >= 0.5) return "bg-secondary";
    if (intensity >= 0.25) return "bg-accent";
    return "bg-secondary/40";
  };

  return (
  <div className="space-y-3">
    <div className="overflow-x-auto pb-1">
      
      <div className="flex gap-1 pl-10 mb-1">
        {weeks.map((_, weekIndex) => {
          const monthLabel = monthLabels.find((item) => item.startWeek === weekIndex);
          return (
            <div key={weekIndex} className="min-w-4 flex-none text-xs text-muted-foreground">
              {monthLabel?.month || ""}
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2">
        <div className="flex flex-col justify-between gap-1 pr-1 text-xs text-muted-foreground">
          {DAY_LABELS.map((day, index) => (
            <div
              key={day}
              className="flex h-3.5 items-center"
              style={{ opacity: index % 2 === 0 ? 1 : 0.6 }}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`size-3.5 rounded-full border border-border/50 ${getColor(day.count)} cursor-pointer transition-all hover:scale-110 hover:ring-2 hover:ring-primary/40`}
                  title={`${format(day.date, "EEE, MMM d, yyyy")}: ${day.count} completions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

    </div>

    <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
      <span>Less</span>
      <div className="flex gap-1">
        <div className="size-3 rounded-full border border-border/50 bg-muted" />
        <div className="size-3 rounded-full border border-border/50 bg-secondary/40" />
        <div className="size-3 rounded-full border border-border/50 bg-accent" />
        <div className="size-3 rounded-full border border-border/50 bg-secondary" />
        <div className="size-3 rounded-full border border-border/50 bg-primary" />
      </div>
      <span>More</span>
    </div>

  </div>
  );
}

export default CalendarHeatmap;
