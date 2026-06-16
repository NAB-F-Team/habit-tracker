import {
    Play,
    Pause,
    Archive,
    Edit2,
    Trash2,
    BookOpen,
    Dumbbell,
    Droplet,
    Briefcase,
    Smile,
    HelpCircle
} from "lucide-react";
import { Button } from "../ui/button";
import StatusBadge from "../shared/StatusBadge";
import { DAYS_OF_WEEK } from "../../constants/units";

const CATEGORY_ICONS = {
    Fitness: Dumbbell,
    Health: Droplet,
    Mindfulness: Smile,
    Study: BookOpen,
    Work: Briefcase,
    Other: HelpCircle
};

const CATEGORY_STYLES = {
    Fitness: { surface: "bg-accent/35 border-accent/20", icon: "text-accent-foreground", border: "border-l-accent" },
    Health: { surface: "bg-secondary/35 border-secondary/20", icon: "text-secondary-foreground", border: "border-l-secondary" },
    Mindfulness: { surface: "bg-primary/15 border-primary/10", icon: "text-primary", border: "border-l-primary" },
    Study: { surface: "bg-primary/15 border-primary/10", icon: "text-primary", border: "border-l-primary" },
    Work: { surface: "bg-accent/35 border-accent/20", icon: "text-accent-foreground", border: "border-l-accent" },
    Other: { surface: "bg-muted border-border", icon: "text-muted-foreground", border: "border-l-muted-foreground" }
};

const PRIORITY_TONES = {
    High: "danger",
    Medium: "warning",
    Low: "info"
};

const STATUS_TONES = {
    Active: "success",
    Paused: "warning",
    Archived: "muted"
};

const getFrequencyLabel = (habit) => {
    if (habit.frequency === "Daily") return "Daily";
    if (!habit.daysOfWeek || habit.daysOfWeek.length === 0) return "Specific days";
    return habit.daysOfWeek
        .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label || d)
        .join(", ");
};

export default function HabitList({
    habits,
    onToggleStatus,
    onToggleArchive,
    onEdit,
    onDelete
}) {
    return (
        <div className="space-y-3">
            {habits.map((habit) => {
                const CategoryIcon = CATEGORY_ICONS[habit.category] || HelpCircle;
                const categoryStyles = CATEGORY_STYLES[habit.category] || CATEGORY_STYLES.Other;

                return (
                    <div
                        key={habit.id}
                        className={`overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all border-l-4 ${categoryStyles.border}`}
                    >
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div
                                    className={`flex size-12 items-center justify-center rounded-2xl border ${categoryStyles.surface}`}
                                >
                                    <CategoryIcon className={`size-5 ${categoryStyles.icon}`} />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="font-semibold text-foreground text-base sm:text-lg">
                                            {habit.name}
                                        </h4>
                                        <div className="flex gap-1.5">
                                            <StatusBadge tone={STATUS_TONES[habit.status] || "muted"}>
                                                {habit.status}
                                            </StatusBadge>
                                            <StatusBadge tone={PRIORITY_TONES[habit.priority] || "muted"}>
                                                {habit.priority}
                                            </StatusBadge>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                        <span>
                                            Target: <strong className="text-foreground">{habit.targetPerDay}</strong> {habit.targetUnit}/day
                                        </span>
                                        <span>•</span>
                                        <span>
                                            Frequency: <strong className="text-foreground">{getFrequencyLabel(habit)}</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onToggleStatus(habit)}
                                    disabled={habit.status === "Archived"}
                                    title={habit.status === "Active" ? "Pause habit" : "Activate habit"}
                                >
                                    {habit.status === "Active" ? (
                                        <Pause className="size-4" />
                                    ) : (
                                        <Play className="size-4" />
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onToggleArchive(habit)}
                                    title={habit.status === "Archived" ? "Restore habit" : "Archive habit"}
                                >
                                    <Archive className="size-4" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onEdit(habit)}
                                    title="Edit habit"
                                >
                                    <Edit2 className="size-4" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onDelete(habit.id)}
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 hover:border-destructive/30"
                                    title="Delete habit"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
