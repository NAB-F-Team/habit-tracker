import { Check, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import StatusBadge from "../shared/StatusBadge";
import ProgressBar from "../shared/ProgressBar";
import { cn } from "../ui/utils";

const PRIORITY_TONES = {
  High: "danger",
  Medium: "info",
  Low: "muted"
};

const PROGRESS_BAR_STYLES = {
  Completed: "bg-secondary",
  "In Progress": "bg-primary",
  "Not Started": "bg-destructive"
};

function CheckInCard({
  habit,
  checkIn,
  icon: Icon,
  categorySurfaceClassName,
  categoryIconClassName,
  statusTone,
  statusLabel,
  habitStatusLabel,
  habitStatusTone = "muted",
  onIncrement,
  onDecrement,
  onMarkDone,
  canIncrement = true,
  canDecrement = true,
  canMarkDone = true,
  isMissedToday = false,
  progressValue = 0,
  className
}) {
  const completedCount = checkIn?.completedCount || 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-sm",
        isMissedToday ? "border-destructive/70 shadow-md shadow-destructive/15 ring-2 ring-destructive/20" : "border-border",
        className
      )}
    >
      <div className={cn("border-l-4 p-4 sm:p-5", isMissedToday ? "border-l-[6px] border-l-destructive" : "border-l-primary/60")}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className={cn("flex size-11 items-center justify-center rounded-xl", categorySurfaceClassName)}>
              {Icon ? <Icon className={cn("size-5", categoryIconClassName)} /> : null}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-start gap-2">
                <h4 className="truncate font-semibold text-foreground">{habit.name}</h4>
                <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
                {habitStatusLabel ? <StatusBadge tone={habitStatusTone}>{habitStatusLabel}</StatusBadge> : null}
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {completedCount}/{habit.targetPerDay} {habit.targetUnit}
                {statusLabel === "Not Started" ? <span className="text-muted-foreground/70"> - LATE</span> : null}
              </p>

              <ProgressBar
                value={Math.min(progressValue, 100)}
                className="mt-3 max-w-xs"
                trackClassName="bg-muted/70"
                barClassName={PROGRESS_BAR_STYLES[statusLabel] || "bg-primary"}
              />
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 md:ml-auto md:items-end">
            <StatusBadge tone={PRIORITY_TONES[habit.priority] || "muted"}>{habit.priority}</StatusBadge>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDecrement(habit.id)}
                disabled={!canDecrement}
                aria-label="Decrease count"
              >
                <Minus className="size-4" />
              </Button>

              <div className="min-w-[72px] rounded-lg border border-border bg-muted/40 px-4 py-2 text-center">
                <span className="font-semibold text-foreground">{completedCount}</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => onIncrement(habit.id)}
                disabled={!canIncrement}
                aria-label="Increase count"
              >
                <Plus className="size-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => onMarkDone(habit.id)}
                disabled={!canMarkDone}
                className="gap-2"
              >
                <Check className="size-4" />
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckInCard;
