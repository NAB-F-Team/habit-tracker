# Habit Tracker Pro

A web application for building, tracking, and analyzing daily habits, built with React, Redux Toolkit, and Vite.

**Live Demo**: [https://habit-tracker-eight-gold.vercel.app/]

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [State Management & Architecture](#state-management--architecture)
- [Rules & Logic Specification](#rules--logic-specification)
- [Getting Started](#getting-started)
- [Known Limitations](#known-limitations)

---

## Features

### **Habit Management** (`/habits`)
- Create habits with name, category, frequency (`Daily` / `Specific days`), target per day, target unit, and priority.
- Edit or delete existing habits.
- **Pause & Resume**: Temporarily pause a habit for exactly **1 calendar day**. Enforces a limit of **maximum 2 paused habits per day**.
- **Archive & Restore**: Archive habits to retire them permanently from daily check-ins.
- Filter habits by category, priority, status, and frequency.
- **Undo Actions**: Undo the last add, edit, or delete action via `undoLastHabitAction`.

### **Daily Check-in** (`/` - Home page)
- View all habits trackable for a selected date, sorted by priority then creation date.
- Dynamic trackability check: Habits that were paused on, created after, or archived before/on the selected date are automatically filtered out.
- Increase or decrease the completed count for each habit.
- Check-in status is derived in real-time: `Not Started` → `In Progress` → `Completed`.
- **Undo Check-in**: Undo the last check-in modification via `undoLastCheckinAction`.

### **Goals & Progress Rules** (`/goals`)
- Set a milestone goal for each habit: `Streak` and `Total Completions`.
- Progress is computed dynamically from raw check-in data.
- Progress milestones:
  - >= 80% → status: `Nearing Completion`
  - 100% → status: `Achieved`
- Goals associated with **archived habits** are automatically hidden from the active goals list and goal metrics.

### **Statistics Dashboard** (`/stats`)
- Overall metrics: % of habits completed today, active habit count, habits at risk of breaking a streak (streak < 3 days).
- Per-category distribution of active habits.
- Calendar heatmap visualizing daily check-in activity and completion density.
- Per-habit stats table: Current Streak, Longest Streak, Total Completions, and 7-day Completion Rate.
- JSON export for downloading all habits, check-ins, and goals as `habit-data.json`.
- Weekly progress line chart showing daily completion rates (%) by category.

---

## Tech Stack

| Layer | Technology | Version | Description |
|---|---|---|---|
| UI Framework | React | ^19.2 | Frontend library |
| State Management | Redux Toolkit | ^2.12 | Global state slices and actions |
| Routing | React Router DOM | ^7.17 | Declarative routing |
| Styling | Tailwind CSS v4 | ^4.3 | Styling framework |
| Component Primitives | Radix UI | various | Primitive UI controls (Dialog, Select, Switch, etc.) |
| Date Utilities | date-fns | ^4.4 | Parsing and formatting dates |
| Build Tool | Vite | ^8.0 | Development server and bundler |

---

## Project Structure

```
src/
├── app/
│   └── store.js                 # Redux store config + slices combination + localStorage subscribe
├── components/
│   ├── domain/                  # Feature-specific components (HabitForm, CheckInCard, GoalCard, etc.)
│   ├── layout/                  # App layout shell and sidebar
│   ├── shared/                  # Reusable UI blocks (CalendarHeatMap, MetricCard, ProgressBar, etc.)
│   └── ui/                      # Low-level primitives (Button, Badge, Dialog, Select, etc.)
├── constants/                   # Shared enums: categories, priorities, statuses, units
├── data/                        # Seed JSON files + seedData.js loader
├── features/
│   ├── habits/habitSlice.js     # Habits slice (list, filters, lastAction)
│   ├── checkins/checkinSlice.js # Check-ins slice (list, lastAction)
│   ├── goals/goalsSlice.js      # Goals slice (list, goalsPage)
│   └── statistics/              # selectors and analytics selector logic
├── hooks/                       # useDebounce, etc.
├── pages/                       # Route-level page components
├── services/
│   ├── exportService.js         # JSON data export
│   └── localStorageService.js   # localStorage load/save persistence
├── styles/                      # Tailwind styles and globals
└── utils/
    ├── analyticsUtils.js        # Dynamic statistics, streak and goal calculations
    └── statisticsUtils.js       # Heatmap and category stats aggregations
```

---

## State Management & Architecture

The application implements a **single source of truth** architecture. To prevent data duplication and stale states, **no derived state is stored in Redux**. All stats, streaks, and progress metrics are computed dynamically on the fly from the raw, normalized collections.

### 1. Store Slices

The global state consists of three main normalized slices:

#### A. **Habits Slice** (`habits`)
Manages the list of habits, filters, and undo metadata.
* **`list`**: Array of raw habit definitions.
  ```json
  {
    "id": "hb1",
    "name": "Drink water",
    "category": "Health",
    "frequency": "Daily",
    "targetPerDay": 8,
    "targetUnit": "cups",
    "priority": "High",
    "status": "Active",
    "pausedAt": null,
    "archivedAt": null,
    "createdAt": "2026-06-01T00:00:00Z"
  }
  ```
* **`filters`**: Active search queries and filter options.
* **`lastAction`**: Stores the previous state of the last modified habit for the single-step **Undo** action.

#### B. **Check-ins Slice** (`checkins`)
Manages the record of completed check-in actions.
* **`list`**: Flat history array of all check-in counts by date.
  ```json
  {
    "id": "ci1",
    "habitId": "hb1",
    "date": "2026-06-22",
    "completedCount": 8,
    "status": "Completed",
    "createdAt": "2026-06-22T09:00:00Z"
  }
  ```
* **`lastAction`**: Stores the metadata for the check-in **Undo** action.

#### C. **Goals Slice** (`goals`)
Manages user milestones mapped to habits.
* **`list`**: Milestones target values.
  ```json
  {
    "id": "gl1",
    "habitId": "hb1",
    "targetType": "Streak",
    "targetValue": 30,
    "createdAt": "2026-06-01T00:00:00Z"
  }
  ```
* **`goalsPage`**: Standard pagination state for rendering list pages.

---

### 2. Derived State and Analytics Flow

Whenever a component needs computed metadata, it is calculated in real-time using helper utilities in `src/utils/`:

* **`getGoalProgress(goal, habit, checkIns)`**: Calculates goal completion percent. If the goal type is `"Streak"`, it checks the current streak of the habit. If it is `"Total Completions"`, it counts completed check-ins.
* **`calculateHabitStats(habit, checkins)`** & **`getStreakStats(habit, checkins)`**:
  * Extracts completed check-ins for the habit.
  * Dynamically computes the **Current Streak** and **Longest Streak**.
  * Adjusts calculations to account for **Paused** days (skips paused days instead of breaking streaks) and **Archived** status.

This approach eliminates synchronization bugs: if a check-in is added, updated, or undone, the goals and statistics pages instantly reflect the change without requiring explicit side effects to keep Redux in sync.

---

### 3. Data Persistence & LocalStorage Flow

To ensure data is retained across page reloads, the application persists the raw state slices in the browser's `localStorage` using the service defined in [localStorageService.js](./src/services/localStorageService.js):

- **Key**: All state data is stored under the localStorage key `habitTracker:v1`.
- **Loading & Initialization (`loadState`)**:
  - On application startup, [store.js](./src/app/store.js) invokes `loadState()` to populate the store's `preloadedState`.
  - **Fallback to Seed Data**: If `localStorage` is empty, `loadState()` returns `undefined`. This triggers Redux Toolkit to fall back to the default initial states populated from the initial JSON datasets ([habits.json](./src/data/habits.json), [goals.json](./src/data/goals.json), and [checkins.json](./src/data/checkins.json)).
  - **State Normalization**: When parsing retrieved state, `normalizeState` ensures all structural properties exist. Furthermore, `normalizeHabit` sanitizes each habit object (e.g., ensuring `pausedAt` and `archivedAt` are present and default to `null`, or initializing them with the current timestamp if the habit status is `"Paused"` or `"Archived"` but they are missing).
- **Saving (`saveState`)**:
  - The store subscribes to state transitions using `store.subscribe()`.
  - Every dispatched action that mutates the store automatically serializes the active slices (`habits`, `checkins`, `goals`) and writes the updated JSON string to `localStorage`.
- **Resetting (`clearState`)**:
  - The user can clear the state to revert back to default seed data (triggered via the UI settings/reset panel), which calls `clearState()` to remove the storage key and prompts a window reload.

---

## Rules & Logic Specification

### 1. Habit Pausing Logic (Tạm dừng)
* **Duration**: A pause is a **temporary, 1-day suspension** of a habit.
* **Trackability**: On the date of the pause (`selectedDate === pausedAt`), the habit is hidden from the Daily Check-in list.
* **Automatic Resume**: On any subsequent date (`selectedDate !== pausedAt`), the habit automatically reappears in the Daily Check-in list as `"Active"`, allowing check-ins to resume without user intervention.
* **Streak Preservation**: If a habit is paused on date X, and the user checked in on date X-1, checking in on date X+1 will continue the streak. The paused day (X) is skipped in the day-difference calculation and does not reset the current streak.
* **Daily Pause Limit**: A user can pause **at most 2 habits per calendar day**. Toggling a habit to "Paused" in the list or updating its status to "Paused" in the form is blocked if 2 habits have already been paused today.

### 2. Habit Archiving Logic (Lưu trữ)
* **Duration**: Archiving is a permanent retirement of a habit.
* **Trackability**: From the date of archiving onwards (`selectedDate >= archivedAt`), the habit is permanently hidden from the Daily Check-in list.
* **Streak Reset**: The current streak of an archived habit immediately resets to **0**.
* **Goal Hiding**: The goal associated with an archived habit is automatically filtered out from the Goals page and doesn't count towards active goal statistics.

---

## Getting Started

Follow these steps to run the application locally:

```bash
# 1. Clone the repository
git clone https://github.com/NAB-F-Team/habit-tracker.git
cd habit-tracker

# 2. Install package dependencies
npm install

# 3. Launch the development server
npm run dev

# 4. Create production build bundle
npm run build
```

---

## Known Limitations

1. **Local storage only**: No cloud backup exists; clearing browser data will wipe all habits and check-in history.
2. **Local clock dependency**: Calendar calculations rely on the system clock. Changes in timezone or crossing midnight mid-session can shift day boundaries.
3. **Undo history stack size**: The undo operations for both habits and check-ins have a stack size of 1. Reloading the page clears the undo memory.
4. **Single-user environment**: Lacks user authentication, meaning multiple people sharing the same browser profile share the same habit database.