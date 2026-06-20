import { cn } from "../ui/utils";

function ProgressBar({ value = 0, className, trackClassName, barClassName, label }) {
  return (
    <div className={cn("w-full", className)}>
      {label ? <div className="mb-2 text-sm text-muted-foreground">{label}</div> : null}
      <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", trackClassName)}>
        <div className={cn("h-full rounded-full transition-all duration-300", barClassName)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default ProgressBar;
