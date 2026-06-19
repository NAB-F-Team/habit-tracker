import { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { Activity, AlertTriangle, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, format, getDay, getDaysInMonth, startOfMonth, subMonths, subDays, addDays } from "date-fns";

import MetricCard from "../components/shared/MetricCard";
import ProgressBar from "../components/shared/ProgressBar";
import ResponsiveHeader from "../components/shared/ResponsiveHeader";
import ResponsivePageContainer from "../components/shared/ResponsivePageContainer";
import SectionCard from "../components/shared/SectionCard";
import { getStatisticsPageData, getStreakStats, getSevenDayCompletionRate, getDateKey, isCompleted } from "../utils/statisticsUtils";
import CalendarHeatmap from "../components/shared/CalendarHeatMap";
import { Button } from "../components/ui/button";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CATEGORY_STYLES = {
  Health: { dot: "bg-secondary", label: "text-secondary-foreground" },
  Study: { dot: "bg-primary", label: "text-primary" },
  Work: { dot: "bg-accent", label: "text-accent-foreground" },
  Mindfulness: { dot: "bg-primary/70", label: "text-primary" },
  Fitness: { dot: "bg-secondary/70", label: "text-secondary-foreground" },
  Other: { dot: "bg-muted-foreground", label: "text-muted-foreground" }
};
// Use the shared calendar heatmap component located at ../components/shared/CalendarHeatMap

function LineChart({ categories, activeHabits, checkins }) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return { key: getDateKey(date), label: format(date, "EEE") };
  }), []);

  // Build series per category based on active habits
  const series = useMemo(() => {
    return categories.map((category) => {
      const catName = category.name;
      const habitsInCat = activeHabits.filter((h) => (h.category || "Other") === catName);
      const total = habitsInCat.length;

      if (total === 0) return null;

      const habitById = Object.fromEntries(habitsInCat.map((h) => [h.id, h]));

      const values = days.map((d) => {
        const checkinsOnDay = checkins.filter((c) => c.date === d.key && habitById[c.habitId]);
        const completedCount = checkinsOnDay.filter((c) => isCompleted(habitById[c.habitId], c)).reduce((acc, c) => {
          // count unique habit ids that were completed
          return acc + (isCompleted(habitById[c.habitId], c) ? 1 : 0);
        }, 0);

        const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        return percent;
      });

      return { name: catName, values };
    }).filter(Boolean);
  }, [categories, activeHabits, checkins, days]);

  if (!series.length) return <div className="text-sm text-muted-foreground">No data to display</div>;

  const width = 700;
  const height = 260;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const xStep = plotWidth / (days.length - 1);

  const colorClasses = ["text-primary", "text-secondary", "text-accent", "text-primary/70", "text-secondary/70", "text-muted-foreground"];

  return (
    <div className="overflow-x-auto">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Y axis grid & labels */}
          {Array.from({ length: 5 }, (_, i) => {
            const y = (i / 4) * plotHeight;
            const label = 100 - (i * 25);
            return (
              <g key={i}>
                <line x1={0} y1={y} x2={plotWidth} y2={y} stroke="#e6e6e6" strokeWidth="1" />
                <text x={-10} y={y + 4} textAnchor="end" fontSize="10" fill="#666">{label}%</text>
              </g>
            );
          })}

          {/* X axis labels */}
          {days.map((d, i) => (
            <text key={d.key} x={i * xStep} y={plotHeight + 18} textAnchor="middle" fontSize="10" fill="#666">{d.label}</text>
          ))}

          {/* Lines */}
          {series.map((s, si) => {
            const points = s.values.map((v, i) => {
              const x = i * xStep;
              const y = ((100 - v) / 100) * plotHeight;
              return `${x},${y}`;
            }).join(" ");

            const colorClass = colorClasses[si % colorClasses.length];

            return (
              <g key={s.name}>
                <polyline points={points} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={colorClass} />
                {s.values.map((v, i) => {
                  const x = i * xStep;
                  const y = ((100 - v) / 100) * plotHeight;
                  return <circle key={i} cx={x} cy={y} r={3} fill="currentColor" className={colorClass} />;
                })}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="mt-3 flex flex-wrap gap-3">
        {series.map((s, si) => (
          <div key={s.name} className="flex items-center gap-2 text-sm">
            <div className={`size-3 rounded-full ${CATEGORY_STYLES[s.name]?.dot || CATEGORY_STYLES.Other.dot}`} />
            <span className="text-muted-foreground">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  const habits = useSelector((state) => state.habits.list);
  const checkins = useSelector((state) => state.checkins.list);
  const goals = useSelector((state) => state.goals.list);

  const handleExport = () => {
    const payload = { habits, checkins, goals };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habit-data-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => getStatisticsPageData(habits, checkins), [habits, checkins]);

  return (
    <ResponsivePageContainer>
      <ResponsiveHeader title="Statistics" description="Analytics and insights for your habits" />

      <div className="flex items-start justify-end mb-3">
        <Button onClick={handleExport} variant="ghost">Export JSON</Button>
      </div>

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
          <CalendarHeatmap data={stats.activityData} />
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

      <div className="mt-6">
        <SectionCard title="Weekly Completion by Category" contentClassName="p-4">
          <LineChart categories={stats.categories} activeHabits={stats.activeHabits} checkins={checkins} />
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
