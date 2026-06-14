import { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { Activity, AlertTriangle, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, format, getDay, getDaysInMonth, startOfMonth, subDays, subMonths } from "date-fns";

import MetricCard from "../components/shared/MetricCard";
import ProgressBar from "../components/shared/ProgressBar";
import ResponsiveHeader from "../components/shared/ResponsiveHeader";
import ResponsivePageContainer from "../components/shared/ResponsivePageContainer";
import SectionCard from "../components/shared/SectionCard";
import { getStatisticsPageData, getStreakStats, getSevenDayCompletionRate, getDateKey } from "../utils/statisticsUtils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CATEGORY_STYLES = {
  Health: { dot: "bg-secondary", label: "text-secondary-foreground" },
  Study: { dot: "bg-primary", label: "text-primary" },
  Work: { dot: "bg-accent", label: "text-accent-foreground" },
  Mindfulness: { dot: "bg-primary/70", label: "text-primary" },
  Fitness: { dot: "bg-secondary/70", label: "text-secondary-foreground" },
  Other: { dot: "bg-muted-foreground", label: "text-muted-foreground" }
};

function ActivityHeatmap({ data }) {
  const scrollRef = useRef(null);
  const { months, maxValue } = useMemo(() => {
    const countsByDate = Object.fromEntries(data.map((item) => [item.date, item.count]));
    const firstMonth = startOfMonth(subMonths(new Date(), 11));
    const builtMonths = Array.from({ length: 12 }, (_, monthOffset) => {
      const monthStart = addMonths(firstMonth, monthOffset);
      const daysInMonth = getDaysInMonth(monthStart);
      const leadingEmptyDays = getDay(monthStart);
      const weekColumns = Math.ceil((leadingEmptyDays + daysInMonth) / 7);
      const cells = [];

      for (let column = 0; column < weekColumns; column += 1) {
        for (let weekday = 0; weekday < 7; weekday += 1) {
          const dayNumber = column * 7 + weekday - leadingEmptyDays + 1;

          if (dayNumber < 1 || dayNumber > daysInMonth) {
            cells.push({ key: `${column}-${weekday}`, isPlaceholder: true });
            continue;
          }

          const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), dayNumber);
          const dateKey = getDateKey(date);

          cells.push({
            key: dateKey,
            date,
            count: countsByDate[dateKey] || 0
          });
        }
      }

      return {
        key: format(monthStart, "yyyy-MM"),
        label: format(monthStart, "MMM"),
        cells
      };
    });

    return {
      months: builtMonths,
      maxValue: Math.max(...data.map((item) => item.count), 1)
    };
  }, [data]);

  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    requestAnimationFrame(() => {
      scrollElement.scrollLeft = scrollElement.scrollWidth;
    });
  }, [months]);

  const getIntensityClass = (count) => {
    if (count === 0) {
      return "bg-muted";
    }

    const ratio = count / maxValue;

    if (ratio >= 0.75) {
      return "bg-primary";
    }
    if (ratio >= 0.5) {
      return "bg-secondary";
    }
    if (ratio >= 0.25) {
      return "bg-accent";
    }
    return "bg-secondary/40";
  };

  const scrollHeatmap = (direction) => {
    scrollRef.current?.scrollBy({ left: direction * 260, behavior: "smooth" });
  };

  const handleWheel = (event) => {
    if (!scrollRef.current || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      return;
    }

    scrollRef.current.scrollLeft += event.deltaY;
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-1">
        <button
          type="button"
          onClick={() => scrollHeatmap(-1)}
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Scroll activity overview left"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollHeatmap(1)}
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Scroll activity overview right"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div ref={scrollRef} onWheel={handleWheel} className="scrollbar-hide overflow-x-auto pb-1">
        <div className="min-w-max space-y-3">
          <div className="grid grid-cols-[2rem_1fr] gap-2">
            <div />
            <div className="flex gap-3">
              {months.map((month) => (
                <div key={month.key} className="text-center text-xs text-muted-foreground" style={{ width: `${Math.ceil(month.cells.length / 7) * 1.125 - 0.25}rem` }}>
                  {month.label}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[2rem_1fr] gap-2">
            <div className="flex flex-col justify-between gap-1 text-xs text-muted-foreground">
              {WEEKDAY_LABELS.map((day, index) => (
                <div key={day} className="flex h-3.5 items-center" style={{ opacity: index % 2 === 0 ? 1 : 0.6 }}>
                  {day}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              {months.map((month) => (
                <div key={month.key} className="grid grid-flow-col grid-rows-7 gap-1">
                  {month.cells.map((day) =>
                    day.isPlaceholder ? (
                      <div key={day.key} className="size-3.5" aria-hidden="true" />
                    ) : (
                      <div
                        key={day.key}
                        className={`size-3.5 cursor-pointer rounded-full border border-border/50 transition-all hover:scale-110 hover:ring-2 hover:ring-primary/40 ${getIntensityClass(day.count)}`}
                        title={`${format(day.date, "EEE, MMM d, yyyy")}: ${day.count} check-ins`}
                      />
                    )
                  )}
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

export default function StatisticsPage() {
  const habits = useSelector((state) => state.habits.list);
  const checkins = useSelector((state) => state.checkins.list);

  const stats = useMemo(() => getStatisticsPageData(habits, checkins), [habits, checkins]);

  return (
    <ResponsivePageContainer>
      <ResponsiveHeader title="Statistics" description="Analytics and insights for your habits" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Completed Today"
          value={`${stats.completedTodayPercent}%`}
          icon={Activity}
          accentClassName="bg-secondary/30 text-secondary-foreground"
          progressValue={stats.completedTodayPercent}
        />
        <MetricCard
          label="Active Habits"
          value={stats.activeHabits.length}
          icon={BarChart3}
          accentClassName="bg-primary/15 text-primary"
          helperText={`Across ${stats.categories.length} categories`}
        />
        <MetricCard
          label="At Risk"
          value={stats.atRiskCount}
          icon={AlertTriangle}
          accentClassName="bg-destructive/10 text-destructive"
          valueClassName="text-destructive"
          helperText="Streaks under 3 days"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Activity Overview" className="lg:col-span-2" contentClassName="p-4">
          <ActivityHeatmap data={stats.activityData} />
        </SectionCard>

        <SectionCard title="Category Distribution" contentClassName="p-4">
          <div className="space-y-3">
            {stats.categories.map((category) => {
              const style = CATEGORY_STYLES[category.name] || CATEGORY_STYLES.Other;

              return (
                <div key={category.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`size-3 rounded-full ${style.dot}`} />
                    <span className={`font-medium ${style.label}`}>{category.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {category.count} {category.count === 1 ? "habit" : "habits"}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        {stats.categories.map((category) => {
          const categoryHabits = stats.activeHabits
            .filter((habit) => habit.category === category.name)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          if (categoryHabits.length === 0) {
            return null;
          }

          return (
            <SectionCard key={category.name} title={`${category.name} (${category.count} habits)`} contentClassName="p-5 sm:p-6">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Habit</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Streak</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Longest Streak</th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Completions</th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Completion Rate (7d)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {categoryHabits.map((habit) => {
                      const habitCheckins = stats.checkinsByHabit[habit.id] || [];
                      const streak = getStreakStats(habit, habitCheckins);
                      const completionRate = getSevenDayCompletionRate(habit, habitCheckins);

                      return (
                        <tr key={habit.id}>
                          <td className="py-4">
                            <span className="font-medium text-foreground">{habit.name}</span>
                          </td>
                          <td className="py-4">
                            <span className="text-muted-foreground">{streak.currentStreak} days</span>
                          </td>
                          <td className="py-4">
                            <span className="text-muted-foreground">{streak.longestStreak} days</span>
                          </td>
                          <td className="py-4">
                            <span className="text-muted-foreground">{streak.totalCompletions}</span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center justify-end gap-3">
                              <ProgressBar value={completionRate} className="w-32" barClassName="bg-primary" />
                              <span className="min-w-[40px] font-medium text-foreground">{completionRate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </ResponsivePageContainer>
  );
}
