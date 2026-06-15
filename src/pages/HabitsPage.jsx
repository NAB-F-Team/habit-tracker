import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    RotateCcw,
    BookOpen,
    Dumbbell,
    Droplet,
    Briefcase,
    Smile,
    HelpCircle,
    Play,
    Pause,
    Archive
} from "lucide-react";
import { deleteHabit, updateHabit } from "../features/habits/habitSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import SectionCard from "../components/shared/SectionCard";
import EmptyState from "../components/shared/EmptyState";
import PaginationControls from "../components/shared/PaginationControls";
import StatusBadge from "../components/shared/StatusBadge";
import HabitForm from "../components/domain/HabitForm";
import ResponsivePageContainer from "../components/shared/ResponsivePageContainer";
import ResponsiveHeader from "../components/shared/ResponsiveHeader";
import { HABIT_CATEGORIES } from "../constants/categories";
import { HABIT_PRIORITIES } from "../constants/priorities";
import { DAYS_OF_WEEK } from "../constants/units";
import { toast } from "sonner";

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

const ITEMS_PER_PAGE = 5;

export default function HabitsPage() {
    const dispatch = useDispatch();
    const habits = useSelector((state) => state.habits.list);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleCategoryFilterChange = (val) => {
        setCategoryFilter(val);
        setCurrentPage(1);
    };

    const handlePriorityFilterChange = (val) => {
        setPriorityFilter(val);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (val) => {
        setStatusFilter(val);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setCategoryFilter("all");
        setPriorityFilter("all");
        setStatusFilter("all");
        setCurrentPage(1);
        toast.success("Filters reset successfully");
    };

    const handleOpenAddForm = () => {
        setEditingHabit(null);
        setIsFormOpen(true);
    };

    const handleOpenEditForm = (habit) => {
        setEditingHabit(habit);
        setIsFormOpen(true);
    };

    const handleDeleteHabit = (id) => {
        if (window.confirm("Are you sure you want to delete this habit? All progress logs will be kept, but the habit itself will be removed.")) {
            dispatch(deleteHabit(id));
            toast.success("Habit deleted successfully");
            // Calculate total pages of the remaining items
            const remainingCount = filteredHabits.length - 1;
            const newTotalPages = Math.ceil(remainingCount / ITEMS_PER_PAGE);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
        }
    };

    const handleToggleStatus = (habit) => {
        const newStatus = habit.status === "Active" ? "Paused" : "Active";
        dispatch(updateHabit({
            ...habit,
            status: newStatus
        }));
        toast.success(`Habit status updated to ${newStatus}`);
    };

    const handleToggleArchive = (habit) => {
        const newStatus = habit.status === "Archived" ? "Active" : "Archived";
        dispatch(updateHabit({
            ...habit,
            status: newStatus
        }));
        toast.success(habit.status === "Archived" ? "Habit restored successfully" : "Habit archived successfully");
    };

    // Filter logic
    const filteredHabits = useMemo(() => {
        return habits.filter((habit) => {
            const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === "all" || habit.category === categoryFilter;
            const matchesPriority = priorityFilter === "all" || habit.priority === priorityFilter;
            const matchesStatus = statusFilter === "all" || habit.status === statusFilter;
            return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
        });
    }, [habits, searchQuery, categoryFilter, priorityFilter, statusFilter]);

    // Pagination logic
    const totalPages = Math.ceil(filteredHabits.length / ITEMS_PER_PAGE);

    const paginatedHabits = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredHabits.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredHabits, currentPage]);

    const getFrequencyLabel = (habit) => {
        if (habit.frequency === "Daily") return "Daily";
        if (!habit.daysOfWeek || habit.daysOfWeek.length === 0) return "Specific days";
        return habit.daysOfWeek
            .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label || d)
            .join(", ");
    };

    const isFiltersActive = searchQuery !== "" || categoryFilter !== "all" || priorityFilter !== "all" || statusFilter !== "all";

    return (
        <ResponsivePageContainer className="pb-8 space-y-6">
            <ResponsiveHeader
                title="Habits"
                description="Manage your custom habits, search, filter and customize goals"
                actions={
                    <Button onClick={handleOpenAddForm}>
                        <Plus className="mr-2 size-4" /> Add Habit
                    </Button>
                }
            />

            <SectionCard contentClassName="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search habits by name..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="pl-9"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {HABIT_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={priorityFilter} onValueChange={handlePriorityFilterChange}>
                            <SelectTrigger className="w-full sm:w-[130px]">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                {HABIT_PRIORITIES.map((pri) => (
                                    <SelectItem key={pri} value={pri}>
                                        {pri}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                            <SelectTrigger className="w-full sm:w-[130px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Paused">Paused</SelectItem>
                                <SelectItem value="Archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>

                        {isFiltersActive ? (
                            <Button variant="ghost" onClick={handleResetFilters} className="px-3">
                                <RotateCcw className="mr-2 size-4" />
                                Clear
                            </Button>
                        ) : null}
                    </div>
                </div>
            </SectionCard>

            {filteredHabits.length === 0 ? (
                <EmptyState
                    icon={Search}
                    title="No habits found"
                    description={
                        isFiltersActive
                            ? "Try adjusting your filters or search query to find what you are looking for."
                            : "Create your first habit by clicking the 'Add Habit' button."
                    }
                />
            ) : (
                <div className="space-y-4">
                    <div className="space-y-3">
                        {paginatedHabits.map((habit) => {
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
                                                onClick={() => handleToggleStatus(habit)}
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
                                                onClick={() => handleToggleArchive(habit)}
                                                title={habit.status === "Archived" ? "Restore habit" : "Archive habit"}
                                            >
                                                <Archive className="size-4" />
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleOpenEditForm(habit)}
                                                title="Edit habit"
                                            >
                                                <Edit2 className="size-4" />
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDeleteHabit(habit.id)}
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

                    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {Math.min(filteredHabits.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} to{" "}
                                {Math.min(currentPage * ITEMS_PER_PAGE, filteredHabits.length)} of {filteredHabits.length} habits
                            </p>
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {isFormOpen && (
                <HabitForm
                    isOpen={isFormOpen}
                    onClose={() => {
                        setIsFormOpen(false);
                        setEditingHabit(null);
                    }}
                    editingHabit={editingHabit}
                />
            )}
        </ResponsivePageContainer>
    );
}
