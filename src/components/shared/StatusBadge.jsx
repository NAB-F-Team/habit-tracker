import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";

const STATUS_TONES = {
    success: "border-secondary/40 bg-secondary/30 text-secondary-foreground",
    warning: "border-accent/50 bg-accent/35 text-foreground",
    danger: "border-destructive/30 bg-destructive/10 text-destructive",
    info: "border-primary/30 bg-primary/15 text-primary",
    muted: "border-border bg-muted text-muted-foreground"
};

function StatusBadge({ tone, className, children }) {
    return <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_TONES[tone], className)}>{children}</Badge>;
}

export default StatusBadge;
