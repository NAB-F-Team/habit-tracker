import { useMemo } from "react";
import { format, startOfWeek, addDays } from "date-fns";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarHeatmap({ data, maxValue }) {
  const { weeks, monthLabels, numWeeks } = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const firstDayOfYear = new Date(currentYear, 0, 1);
    const lastDayOfYear = new Date(currentYear, 11, 31);
    
    // Align with Sunday of the first week of the year
    const weekStart = startOfWeek(firstDayOfYear, { weekStartsOn: 0 });
    const lastWeekStart = startOfWeek(lastDayOfYear, { weekStartsOn: 0 });
    
    // Calculate the exact number of weeks needed for the current calendar year
    const numWeeks = Math.round((lastWeekStart.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    
    const weeksArray = [];
    const monthLabelsArray = [];

    // 1. Generate all days for the calendar year grid
    for (let weekIndex = 0; weekIndex < numWeeks; weekIndex++) {
      const week = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const currentDate = addDays(weekStart, weekIndex * 7 + dayIndex);
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const dataPoint = data.find((item) => item.date === dateStr);

        week.push({
          date: currentDate,
          count: dataPoint?.count || 0
        });
      }
      weeksArray.push(week);
    }

    // 2. Generate month labels using a Wednesday-of-the-week representation
    let lastMonthName = "";
    for (let weekIndex = 0; weekIndex < numWeeks; weekIndex++) {
      const week = weeksArray[weekIndex];
      const monthName = weekIndex === 0 ? "Jan" : format(week[3].date, "MMM");
      
      if (monthName !== lastMonthName) {
        if (weekIndex < numWeeks - 1) {
          monthLabelsArray.push({
            month: monthName,
            startWeek: weekIndex
          });
        }
        lastMonthName = monthName;
      }
    }

    return { weeks: weeksArray, monthLabels: monthLabelsArray, numWeeks };
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

  const gridWidth = numWeeks * 18 - 4; // 14px cell + 4px gap

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-2">
        <div className="w-max pr-4">
          {/* Month labels row */}
          <div className="flex items-start gap-2">
            {/* Spacer to match day labels column */}
            <div className="w-8 shrink-0" />
            
            {/* Relative container for absolute month labels */}
            <div className="relative h-4 text-xs text-muted-foreground mb-1" style={{ width: `${gridWidth}px` }}>
              {monthLabels.map((label, index) => (
                <span
                  key={index}
                  className="absolute"
                  style={{ left: `${label.startWeek * 18}px` }}
                >
                  {label.month}
                </span>
              ))}
            </div>
          </div>

          {/* Grid row */}
          <div className="flex items-start gap-2">
            {/* Day labels column */}
            <div className="w-8 shrink-0 flex flex-col gap-1 text-xs text-muted-foreground">
              {DAY_LABELS.map((day, index) => (
                <div
                  key={day}
                  className="flex h-3.5 items-center justify-end pr-2"
                  style={{ opacity: index % 2 === 0 ? 1 : 0.6 }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks cells grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1 shrink-0">
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

