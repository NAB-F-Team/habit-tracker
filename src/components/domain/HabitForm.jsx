import { useState } from "react";
import { useDispatch } from "react-redux";
import { addHabit, updateHabit } from "../../features/habits/habitSlice";
import { addGoal } from "../../features/goals/goalsSlice";
import { TARGET_UNITS, DAYS_OF_WEEK } from "../../constants/units";
import { HABIT_CATEGORIES, GOAL_TYPES } from "../../constants/categories";
import { HABIT_PRIORITIES } from "../../constants/priorities";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Switch } from "../ui/switch";

const createInitialFormData = (editingHabit) => {
  if (editingHabit) {
    return {
      name: editingHabit.name,
      category: editingHabit.category,
      frequency: editingHabit.frequency,
      targetPerDay: editingHabit.targetPerDay,
      targetUnit: editingHabit.targetUnit,
      priority: editingHabit.priority,
      daysOfWeek: editingHabit.daysOfWeek || [],
      setGoal: false,
      goalType: "Streak",
      goalTarget: 30
    };
  }

  return {
    name: "",
    category: "Health",
    frequency: "Daily",
    targetPerDay: 1,
    targetUnit: "times",
    priority: "Medium",
    daysOfWeek: [],
    setGoal: false,
    goalType: "Streak",
    goalTarget: 30
  };
};

function HabitForm({ isOpen, onClose, editingHabit }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(() => createInitialFormData(editingHabit));
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Habit name is required";
    if (formData.targetPerDay < 0) newErrors.targetPerDay = "Target cannot be negative";
    if (formData.targetPerDay === 0) newErrors.targetPerDay = "Target must be greater than 0";
    if (formData.frequency === "Specific days" && formData.daysOfWeek.length === 0) {
      newErrors.daysOfWeek = "Please select at least one day";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const habitId = editingHabit?.id || `habit-${Date.now()}`;
    const habitData = {
      id: habitId,
      name: formData.name.trim(),
      category: formData.category,
      frequency: formData.frequency,
      targetPerDay: formData.targetPerDay,
      targetUnit: formData.targetUnit,
      priority: formData.priority,
      status: "Active",
      notes: "",
      daysOfWeek: formData.frequency === "Specific days" ? formData.daysOfWeek : undefined,
      createdAt: editingHabit?.createdAt || new Date().toISOString()
    };

    if (editingHabit) {
      dispatch(updateHabit(habitData));
      toast.success("Habit updated successfully");
    } else {
      dispatch(addHabit(habitData));
      toast.success("Habit created successfully");
      if (formData.setGoal) {
        const goalData = {
          id: `goal-${Date.now()}`,
          habitId,
          targetType: formData.goalType,
          targetValue: formData.goalTarget,
          createdAt: new Date().toISOString()
        };
        dispatch(addGoal(goalData));
        toast.success("Goal created successfully");
      }
    }

    onClose();
  };

  const toggleDayOfWeek = (day) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day) ? prev.daysOfWeek.filter((d) => d !== day) : [...prev.daysOfWeek, day].sort()
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-2xl max-h-[calc(100vh-1rem)] overflow-y-auto p-0 sm:w-full">
        <DialogHeader className="sticky top-0 z-10 border-b border-border bg-card px-4 py-4 sm:px-6">
          <DialogTitle className="text-xl text-foreground">{editingHabit ? "Edit Habit" : "Create New Habit"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {editingHabit ? "Update your habit details" : "Add a new habit to track your progress"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Drink water, Read books"
              className={errors.name ? "border-destructive focus-visible:ring-destructive/20" : ""}
            />
            {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HABIT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HABIT_PRIORITIES.map((pri) => (
                    <SelectItem key={pri} value={pri}>
                      {pri}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Specific days">Specific Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.frequency === "Specific days" ? (
            <div className="space-y-2">
              <Label>Select Days</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDayOfWeek(day.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      formData.daysOfWeek.includes(day.value)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              {errors.daysOfWeek ? <p className="text-sm text-destructive">{errors.daysOfWeek}</p> : null}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="target">Target per Day</Label>
              <Input
                id="target"
                type="number"
                min="1"
                value={formData.targetPerDay}
                onChange={(e) => setFormData({ ...formData, targetPerDay: parseInt(e.target.value) || 1 })}
                className={errors.targetPerDay ? "border-destructive focus-visible:ring-destructive/20" : ""}
              />
              {errors.targetPerDay ? <p className="text-sm text-destructive">{errors.targetPerDay}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.targetUnit} onValueChange={(v) => setFormData({ ...formData, targetUnit: v })}>
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">e.g., cups, km, pages, minutes</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Label htmlFor="setGoal" className="cursor-pointer">
                Set Long-term Goal
              </Label>
              <p className="text-xs text-muted-foreground">Optional: Track progress towards a milestone</p>
            </div>
            <Switch
              id="setGoal"
              checked={formData.setGoal}
              onCheckedChange={(checked) => setFormData({ ...formData, setGoal: checked })}
            />
          </div>

          {formData.setGoal ? (
            <div className="space-y-4 rounded-2xl border border-border bg-accent/15 p-4">
              <div className="space-y-2">
                <Label htmlFor="goalType">Goal Type</Label>
                <Select value={formData.goalType} onValueChange={(v) => setFormData({ ...formData, goalType: v })}>
                  <SelectTrigger id="goalType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "Streak" ? "Streak Target (consecutive days)" : "Total Completions Target"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalValue">{formData.goalType === "Streak" ? "Number of Days" : "Number of Completions"}</Label>
                <Input
                  id="goalValue"
                  type="number"
                  min="1"
                  value={formData.goalTarget}
                  onChange={(e) => setFormData({ ...formData, goalTarget: parseInt(e.target.value) || 30 })}
                  placeholder="e.g., 30"
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="sm:w-auto">
              {editingHabit ? "Update Habit" : "Create Habit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default HabitForm;
