import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ListChecks, Target, BarChart3, Settings, Plus, Menu } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setShowAddHabitModal } from "../../features/ui/uiSlice";
import HabitForm from "../domain/HabitForm";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";

const navigation = [
  { name: "Daily Check-ins", path: "/", icon: Home },
  { name: "Habits", path: "/habits", icon: ListChecks },
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Statistics", path: "/stats", icon: BarChart3 },
  { name: "Settings", path: "/settings", icon: Settings }
];

function Sidebar() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);

  const handleNavigate = () => {
    setMobileNavOpen(false);
  };

  const navLinkClass = (isActive) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
      isActive ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
              <p className="font-semibold leading-none text-foreground">Habit Tracker Pro</p>
              <p className="text-xs text-muted-foreground">Mobile dashboard</p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation">
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[86vw] max-w-sm p-0">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle>Habit Tracker Pro</SheetTitle>
            <SheetDescription>Navigate between sections and create habits.</SheetDescription>
          </SheetHeader>

          <div className="flex h-full flex-col gap-4 p-4">
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
                      <Link to={item.path} onClick={handleNavigate} className={navLinkClass(isActive)}>
                        <Icon className="size-5" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

          </div>
        </SheetContent>
      </Sheet>

      <aside className="fixed top-0 left-0 hidden h-screen w-64 flex-col border-r border-border bg-card/95 backdrop-blur md:flex">
        <div className="border-b border-border p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <span className="font-semibold">H</span>
            </div>
            <span className="font-semibold text-foreground">Habit Tracker Pro</span>
          </div>

          <Button onClick={() => setShowAddHabitModal(true)} className="w-full justify-center">
            <Plus className="size-4" />
            Add Habit
          </Button>
        </div>

        <nav className="flex-1 p-4">
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
