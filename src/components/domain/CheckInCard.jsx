import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import StatusBadge from "../shared/StatusBadge";
import ProgressBar from "../shared/ProgressBar";
import { cn } from "../ui/utils";

function CheckInCard({
  habit,
  checkIn,
  icon: Icon,
  categorySurfaceClassName,
  categoryIconClassName,
  statusTone,
  statusLabel,
  onIncrement,
  onDecrement,
  canIncrement = true,
  canDecrement = true,
  progressValue = 0,
  className
}) {
  const completedCount = checkIn?.completedCount || 0;

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-sm", className)}>
      <div className="border-l-4 border-l-primary/60 p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="flex items-start gap-3">
            <div className={cn("flex size-11 items-center justify-center rounded-xl", categorySurfaceClassName)}>
              {Icon ? <Icon className={cn("size-5", categoryIconClassName)} /> : null}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-start gap-2">
                <h4 className="truncate font-semibold text-foreground">{habit.name}</h4>
                <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {completedCount}/{habit.targetPerDay} {habit.targetUnit}
                {statusLabel === "Not Started" ? <span className="text-muted-foreground/70"> · LATE</span> : null}
              </p>

              <ProgressBar value={Math.min(progressValue, 100)} className="mt-3 max-w-xs" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:ml-auto md:justify-end">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckInCard;
