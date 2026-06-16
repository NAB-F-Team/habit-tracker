import { useMemo, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { Plus, Search, RotateCcw } from "lucide-react";
import { deleteHabit, updateHabit, undoLastHabitAction } from "../features/habits/habitSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import SectionCard from "../components/shared/SectionCard";
import EmptyState from "../components/shared/EmptyState";
import PaginationControls from "../components/shared/PaginationControls";
import HabitForm from "../components/domain/HabitForm";
import HabitList from "../components/domain/HabitList";
import ResponsivePageContainer from "../components/shared/ResponsivePageContainer";
import ResponsiveHeader from "../components/shared/ResponsiveHeader";
import { HABIT_CATEGORIES } from "../constants/categories";
import { HABIT_PRIORITIES } from "../constants/priorities";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 5;

export default function HabitsPage() {
    const dispatch = useDispatch();
    const store = useStore();
    const habits = useSelector((state) => state.habits.list);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [frequencyFilter, setFrequencyFilter] = useState("all");
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

    const handleFrequencyFilterChange = (val) => {
        setFrequencyFilter(val);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setCategoryFilter("all");
        setPriorityFilter("all");
        setStatusFilter("all");
        setFrequencyFilter("all");
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

    const createUndoId = (habitId, actionType) => `habit-${actionType}-${habitId}-${Date.now()}`;

    const showUndoToast = (message, undoId) => {
        toast.success(message, {
            action: {
                label: "Undo",
                onClick: () => {
                    const lastHabitAction = store.getState().habits.lastAction;

                    if (lastHabitAction?.undoId !== undoId) {
                        toast.error("That action can no longer be undone");
                        return;
                    }

                    dispatch(undoLastHabitAction(undoId));
                    toast.success("Action undone");
                }
            }
        });
    };

    const handleDeleteHabit = (id) => {
        const undoId = createUndoId(id, "delete");
        dispatch(deleteHabit({ habitId: id, undoId }));
        showUndoToast("Habit deleted", undoId);
        
        const remainingCount = filteredHabits.length - 1;
        const newTotalPages = Math.ceil(remainingCount / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        }
    };

    const handleToggleStatus = (habit) => {
        const newStatus = habit.status === "Active" ? "Paused" : "Active";
        const undoId = createUndoId(habit.id, "toggle-status");
        dispatch(updateHabit({
            habit: { ...habit, status: newStatus },
            undoId
        }));
        showUndoToast(`Habit status updated to ${newStatus}`, undoId);
    };

    const handleToggleArchive = (habit) => {
        const newStatus = habit.status === "Archived" ? "Active" : "Archived";
        const undoId = createUndoId(habit.id, "toggle-archive");
        dispatch(updateHabit({
            habit: { ...habit, status: newStatus },
            undoId
        }));
        showUndoToast(habit.status === "Archived" ? "Habit restored" : "Habit archived", undoId);
    };

    // Filter logic
    const filteredHabits = useMemo(() => {
        return habits.filter((habit) => {
            const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === "all" || habit.category === categoryFilter;
            const matchesPriority = priorityFilter === "all" || habit.priority === priorityFilter;
            const matchesStatus = statusFilter === "all" || habit.status === statusFilter;
            const matchedFrequency = frequencyFilter === "all" || habit.frequency === frequencyFilter;
            return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchedFrequency;
        });
    }, [habits, searchQuery, categoryFilter, priorityFilter, statusFilter, frequencyFilter]);
    // Pagination logic
    const totalPages = Math.ceil(filteredHabits.length / ITEMS_PER_PAGE);

    const paginatedHabits = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredHabits.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredHabits, currentPage]);

    const isFiltersActive = searchQuery !== "" || categoryFilter !== "all" || priorityFilter !== "all" || statusFilter !== "all" || frequencyFilter !== "all";

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

                        <Select value={frequencyFilter} onValueChange={handleFrequencyFilterChange}>
                            <SelectTrigger className="w-full sm:w-[130px]">
                                <SelectValue placeholder="Frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Frequencies</SelectItem>
                                <SelectItem value="Specific days">Specific days</SelectItem>
                                <SelectItem value="Daily">Daily</SelectItem>
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
                    <HabitList
                        habits={paginatedHabits}
                        onToggleStatus={handleToggleStatus}
                        onToggleArchive={handleToggleArchive}
                        onEdit={handleOpenEditForm}
                        onDelete={handleDeleteHabit}
                    />

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
