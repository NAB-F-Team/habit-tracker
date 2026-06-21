import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ListChecks,
  Target,
  BarChart3,
  Plus,
  Menu,
  RotateCcw,
} from "lucide-react";
import HabitForm from "../domain/HabitForm";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

const navigation = [
  { name: "Daily Check-in", path: "/", icon: Home },
  { name: "Habits", path: "/habits", icon: ListChecks },
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Statistics", path: "/stats", icon: BarChart3 },
];

function Sidebar() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);

  const handleNavigate = () => {
    setMobileNavOpen(false);
  };

  const handleResetData = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all data back to the initial state? This will delete all your local changes.",
    );
    if (confirmReset) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const navLinkClass = (isActive) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
      isActive
        ? "bg-primary/15 text-primary font-medium"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm">
              H
            </div>
            <div>
              <p className="font-semibold leading-none text-foreground">
                Habit Tracker Pro
              </p>
              {/* <p className="text-xs text-muted-foreground">Mobile dashboard</p> */}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="right"
          className="w-[86vw] max-w-sm p-0 flex flex-col h-full"
        >
          <SheetHeader className="border-b border-border px-5 py-4 flex-shrink-0">
            <SheetTitle>Habit Tracker Pro</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4 p-4 flex-1 overflow-y-auto">
            <Button
              onClick={() => {
                setShowAddHabitModal(true);
                setMobileNavOpen(false);
              }}
              className="w-full justify-center"
            >
              <Plus className="size-4" />
              Add Habit
            </Button>

            <nav className="flex-1">
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={handleNavigate}
                        className={navLinkClass(isActive)}
                      >
                        <Icon className="size-5" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-border pt-4">
              <Button
                variant="destructive"
                onClick={() => {
                  setMobileNavOpen(false);
                  handleResetData();
                }}
                className="w-full justify-center gap-2"
              >
                <RotateCcw className="size-4" />
                Reset All Data
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <aside className="fixed top-0 left-0 hidden h-screen w-64 flex-col border-r border-border bg-card/95 backdrop-blur md:flex">
        <div className="border-b border-border p-6 flex-shrink-0">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <span className="font-semibold">H</span>
            </div>
            <span className="font-semibold text-foreground">
              Habit Tracker Pro
            </span>
          </div>

          <Button
            onClick={() => setShowAddHabitModal(true)}
            className="w-full justify-center"
          >
            <Plus className="size-4" />
            Add Habit
          </Button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link to={item.path} className={navLinkClass(isActive)}>
                    <Icon className="size-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-4 flex-shrink-0">
          <Button
            variant="destructive"
            onClick={handleResetData}
            className="w-full justify-center gap-2"
          >
            <RotateCcw className="size-4" />
            Reset All Data
          </Button>
        </div>
      </aside>

      <HabitForm
        key={showAddHabitModal ? "habit-form-open" : "habit-form-closed"}
        isOpen={showAddHabitModal}
        onClose={() => setShowAddHabitModal(false)}
      />
    </>
  );
}

export default Sidebar;
