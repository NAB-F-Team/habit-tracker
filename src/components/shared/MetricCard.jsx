import { cn } from "../ui/utils";
import ProgressBar from "./ProgressBar";

function MetricCard({ label, value, icon: Icon, accentClassName, valueClassName, helperText, progressValue }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        {Icon ? (
          <div className={cn("rounded-xl p-3", accentClassName)}>
            <Icon className="size-5" />
          </div>
        ) : null}
      </div>

      <div className={cn("text-4xl font-bold text-foreground", valueClassName)}>{value}</div>
      {helperText ? <div className="mt-2 text-sm text-muted-foreground">{helperText}</div> : null}
      {typeof progressValue === "number" ? (<ProgressBar value={progressValue} className="mt-4" barClassName="bg-primary" />) : null}
    </div>
  );
}

export default MetricCard;
