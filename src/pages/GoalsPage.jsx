import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Target, Trophy, TrendingUp } from "lucide-react";
import ResponsiveHeader from "../components/shared/ResponsiveHeader";
import ResponsivePageContainer from "../components/shared/ResponsivePageContainer";
import MetricCard from "../components/shared/MetricCard";
import EmptyState from "../components/shared/EmptyState";
import PaginationControls from "../components/shared/PaginationControls";
import { setGoalsPage } from "../features/goals/goalsSlice";
import GoalCard from "../components/domain/GoalCard";
import { getGoalProgress } from "../utils/analyticsUtils";

const ITEMS_PER_PAGE = 4;

export default function GoalsPage() {
  const dispatch = useDispatch();
  const habits = useSelector((state) => state.habits.list);
  const goals = useSelector((state) => state.goals.list);
  const checkins = useSelector((state) => state.checkins.list);

  const goalsWithProgress = useMemo(
    () =>
      goals
        .map((goal) => {
          const habit = habits.find((item) => item.id === goal.habitId);
          if (!habit || habit.status === "Archived") return null;
          return getGoalProgress(goal, habit, checkins);
        })
        .filter(Boolean)
        .sort((a, b) => {
          const aAchieved = a.status === "Achieved" ? 1 : 0;
          const bAchieved = b.status === "Achieved" ? 1 : 0;
          if (aAchieved !== bAchieved) {
            return aAchieved - bAchieved;
          }
          return new Date(b.goal.createdAt || 0) - new Date(a.goal.createdAt || 0);
        }),
    [goals, habits, checkins],
  );

  const achievedCount = goalsWithProgress.filter((goal) => goal.status === "Achieved").length;
  const nearingCount = goalsWithProgress.filter((goal) => goal.status === "Nearing Completion").length;
  const totalPages = Math.ceil(goalsWithProgress.length / ITEMS_PER_PAGE);
  const currentPage = useSelector((state) => state.goals.goalsPage);

  const paginatedGoals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return goalsWithProgress.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [goalsWithProgress, currentPage]);

  return (
    <ResponsivePageContainer>
      <ResponsiveHeader title="Goals" description="Track your habit goals and achievements" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Achieved"
          value={achievedCount}
          icon={Trophy}
          accentClassName="bg-secondary/30 text-secondary-foreground"
        />
        <MetricCard
          label="Nearing Completion"
          value={nearingCount}
          icon={TrendingUp}
          accentClassName="bg-primary/15 text-primary"
        />
        <MetricCard
          label="Total Goals"
          value={goalsWithProgress.length}
          icon={Target}
          accentClassName="bg-accent/30 text-accent-foreground"
        />
      </div>

      {goalsWithProgress.length === 0 ? (
        <EmptyState icon={Target} title="No goals yet" description="Set some goals to track your progress" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {paginatedGoals.map((item) => (
              <GoalCard key={item.goal.id} {...item} />
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => dispatch(setGoalsPage(page))} />
            </div>
          </div>
        </>
      )}
    </ResponsivePageContainer>
  );
}