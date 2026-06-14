import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addDays, format, isFuture, subDays } from "date-fns";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Dumbbell,
  SlidersHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { addCheckin, updateCheckin } from "../features/checkins/checkinSlice";
import { Button } from "../components/ui/button";
import SectionCard from "../components/shared/SectionCard";
import EmptyState from "../components/shared/EmptyState";
import ProgressBar from "../components/shared/ProgressBar";
import CheckInCard from "../components/domain/CheckInCard";
import ResponsivePageContainer from "../components/shared/ResponsivePageContainer";
import { getCheckinStatus, getDailyCompletionSummary } from "../utils/analyticsUtils";

const CATEGORY_ICONS = {
  Fitness: Dumbbell,
  Health: Droplet,
  Mindfulness: BookOpen,
  Study: BookOpen,
  Work: Dumbbell,
  Other: Dumbbell
};

const CATEGORY_STYLES = {
  Fitness: { surface: "bg-accent/35", icon: "text-accent-foreground" },
  Health: { surface: "bg-secondary/35", icon: "text-secondary-foreground" },
  Mindfulness: { surface: "bg-muted", icon: "text-foreground" },
  Study: { surface: "bg-primary/15", icon: "text-primary" },
  Work: { surface: "bg-accent/35", icon: "text-accent-foreground" },
  Other: { surface: "bg-muted", icon: "text-muted-foreground" }
};

const STATUS_TONES = {
  Completed: "success",
  "In Progress": "info",
  "Not Started": "danger"
};

function progressMessageFor(completionPercentage) {
  if (completionPercentage === 100) {
    return { title: "Perfect Day!", subtitle: "You completed all your habits today." };
  }

  if (completionPercentage >= 80) {
    return { title: "Great Progress", subtitle: "You're almost done for the day." };
  }

  if (completionPercentage >= 50) {
    return { title: "Keep Going", subtitle: "You're halfway there!" };
  }

  if (completionPercentage > 0) {
    return { title: "Good Start", subtitle: "Keep up the momentum!" };
  }

  return { title: "Start Your Day", subtitle: "Begin tracking your habits." };
}

function DailyCheckinPage() {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const habits = useSelector((state) => state.habits.list);
  const checkins = useSelector((state) => state.checkins.list);

  const { habitData, selectedDateCheckins, completionPercentage } = useMemo(
    () => getDailyCompletionSummary(habits, checkins, selectedDate),
    [habits, checkins, selectedDate]
  );

  const progressMessage = progressMessageFor(completionPercentage);
  const isToday = selectedDate === format(new Date(), "yyyy-MM-dd");

  const handleIncrement = (habitId) => {
    if (isFuture(new Date(selectedDate))) {
      toast.error("Cannot check in for future dates");
      return;
    }

    const habit = habits.find((item) => item.id === habitId);
    if (!habit) return;

    const existingCheckin = selectedDateCheckins.find((checkin) => checkin.habitId === habitId);

    if (existingCheckin) {
      if (existingCheckin.completedCount >= habit.targetPerDay) {
        toast.error("Completed count cannot exceed the daily target");
        return;
      }

      const completedCount = existingCheckin.completedCount + 1;

      dispatch(
        updateCheckin({
          ...existingCheckin,
          completedCount,
          status: getCheckinStatus(completedCount, habit.targetPerDay)
        })
      );
      return;
    }

    dispatch(
      addCheckin({
        id: `checkin-${Date.now()}`,
        habitId,
        date: selectedDate,
        completedCount: 1,
        status: getCheckinStatus(1, habit.targetPerDay),
        createdAt: new Date().toISOString()
      })
    );
  };

  const handleDecrement = (habitId) => {
    const existingCheckin = selectedDateCheckins.find((checkin) => checkin.habitId === habitId);
    if (!existingCheckin || existingCheckin.completedCount <= 0) return;

    const habit = habits.find((item) => item.id === habitId);
    if (!habit) return;

    const completedCount = Math.max(existingCheckin.completedCount - 1, 0);

    dispatch(
      updateCheckin({
        ...existingCheckin,
        completedCount,
        status: getCheckinStatus(completedCount, habit.targetPerDay)
      })
    );
  };

  const goToPreviousDay = () => {
    setSelectedDate(format(subDays(new Date(selectedDate), 1), "yyyy-MM-dd"));
  };

  const goToNextDay = () => {
    setSelectedDate(format(addDays(new Date(selectedDate), 1), "yyyy-MM-dd"));
  };

  const goToToday = () => {
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
  };

  return (
    <ResponsivePageContainer width="lg" className="pb-8 space-y-4 sm:space-y-6">
      <SectionCard contentClassName="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" size="icon" onClick={goToPreviousDay} aria-label="Previous day">
            <ChevronLeft className="size-5" />
          </Button>

          <div className="min-w-0 text-center">
            <div className="text-sm font-semibold text-foreground sm:text-base">
              {format(new Date(selectedDate), "EEEE, MMM d, yyyy")}
            </div>
            {!isToday ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="mt-1 h-7 px-2 text-xs tracking-wide text-muted-foreground"
              >
                Today
              </Button>
            ) : null}
          </div>

          <Button variant="outline" size="icon" onClick={goToNextDay} aria-label="Next day">
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </SectionCard>

      <SectionCard contentClassName="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{progressMessage.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{progressMessage.subtitle}</p>
          </div>
          <div className="text-4xl font-bold text-primary sm:text-5xl">{completionPercentage}%</div>
        </div>

        <ProgressBar
          value={completionPercentage}
          className="mt-4"
          barClassName={
            completionPercentage === 100 ? "bg-secondary" : completionPercentage >= 50 ? "bg-primary" : "bg-accent"
          }
        />
        <p className="mt-2 text-xs text-muted-foreground">{completionPercentage}% of daily habits completed</p>
      </SectionCard>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Daily Check-ins</h3>
          <Button variant="ghost" size="icon" aria-label="Filter habits">
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>

        {habitData.length === 0 ? (
          <EmptyState
            icon={Droplet}
            title="No active habits"
            description="Add some habits to start tracking your progress"
          />
        ) : (
          <div className="space-y-3">
            {habitData.map(({ habit, checkin }) => {
              const completedCount = checkin?.completedCount || 0;
              const status = checkin?.status ?? getCheckinStatus(completedCount, habit.targetPerDay);
              const progress = (completedCount / habit.targetPerDay) * 100;
              const CategoryIcon = CATEGORY_ICONS[habit.category] || Dumbbell;
              const categoryStyles = CATEGORY_STYLES[habit.category] || CATEGORY_STYLES.Other;
              return (
                <CheckInCard
                  key={habit.id}
                  habit={habit}
                  checkIn={checkin}
                  icon={CategoryIcon}
                  categorySurfaceClassName={categoryStyles.surface}
                  categoryIconClassName={categoryStyles.icon}
                  statusTone={STATUS_TONES[status] || "muted"}
                  statusLabel={status}
                  progressValue={progress}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  canIncrement={completedCount < habit.targetPerDay}
                  canDecrement={!!checkin && completedCount > 0}
                />
              );
            })}
          </div>
        )}
      </div>
    </ResponsivePageContainer>
  );
}

export default DailyCheckinPage;
