import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";

const STATUS_TONES = {
    success: "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    danger: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    muted: "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400"
};

function StatusBadge({ tone, className, children }) {
    return <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_TONES[tone], className)}>{children}</Badge>;
}

export default StatusBadge;
