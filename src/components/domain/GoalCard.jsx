import { useRef, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2, TrendingUp } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";
import ProgressBar from "../shared/ProgressBar";

function GoalCard({ goal, habit, current, progress, status }) {
  const prevStatus = useRef(status);

  useEffect(() => {
    if (prevStatus.current === status) return;
    if (status === "Nearing Completion") {
      toast("You're doing great!", {
        description: `Keep it up! You're almost at your goal for ${habit.name}. Just ${goal.target - current} more to go!`,
      });
    } else if (status === "Achieved") {
      toast.success("Goal Achieved!", {
        description: `Congratulations! You've reached your goal for ${habit.name}!`,
      });
    }
    prevStatus.current = status;
  }, [status, habit.name, goal.target, current]);

  const tone = status === "Achieved" ? "success" : status === "Nearing Completion" ? "warning" : "info";

  return (
    <div
      className={`rounded-2xl border-2 bg-card p-5 shadow-sm ${
        status === "Achieved"
          ? "border-secondary/40 bg-secondary/10"
          : status === "Nearing Completion"
            ? "border-accent/50 bg-accent/20"
            : "border-border"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">{habit.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {goal.targetType === "Streak" ? "Streak Target" : "Total Completions Target"}
          </p>
        </div>
        <StatusBadge tone={tone}>{status}</StatusBadge>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              {current} / {goal.targetValue} {goal.targetType === "Streak" ? "days" : "completions"}
            </span>
          </div>
          <ProgressBar
            value={progress}
            barClassName={status === "Achieved" ? "bg-secondary" : status === "Nearing Completion" ? "bg-accent" : "bg-primary"}
          />
          <p className="mt-1 text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
        </div>

        {status === "Nearing Completion" && (
          <div className="flex items-start gap-2 rounded-lg border border-accent/50 bg-accent/25 p-3">
            <TrendingUp className="mt-0.5 size-5 flex-shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">You're almost there!</p>
              <p className="text-sm text-muted-foreground">
                Just {goal.targetValue - current} more {goal.targetType === "Streak" ? "days" : "completions"} to go!
              </p>
            </div>
          </div>
        )}

        {status === "Achieved" && (
          <div className="flex items-start gap-2 rounded-lg border border-secondary/40 bg-secondary/20 p-3">
            <CheckCircle2 className="mt-0.5 size-5 flex-shrink-0 text-secondary-foreground" />
            <div>
              <p className="font-medium text-foreground">Goal Achieved!</p>
              <p className="text-sm text-muted-foreground">Congratulations on reaching your goal!</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default GoalCard;
