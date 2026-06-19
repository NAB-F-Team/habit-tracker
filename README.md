# Habit Tracker Pro

A web application for building, tracking, and analyzing daily habits, built with React and Redux Toolkit.

---

## Table of Contents

- [Features](#feature)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [State Structure](#state-structure)
- [Getting Started](#getting-started)
- [Known Limitation](#known-limitation)

---

## Features
**Habit Management** (`/habits`)
- Create habits with name, category, frequency (`Daily` / `Specific days`), target per day, target unit, and priority
- Edit or delete existing habits
- Pause, resume, or archive habits — archived habits are excluded from daily tracking
- Filter habits by category, priority, status, and frequency
- Undo the last add / edit / delete action via `undoLastHabitAction`

**Daily Check-in** (`/` - home page)
- View all habits trackable for a selected date, sorted by priority then creation date
- Habits created after, paused on, or archived by the selected date are automatically hidden
- Increase or decrease the completed count for each habit
- Check-in status is derived in real time: `Not Started` → `In Progress` → `Completed`
- Undo the last check-in action via `undoLastCheckinAction`

**Goals & Progress Rules** (`/goal`)
- Set a measurable goal for each habit: `Streak` and `Total Completions`
- Goal progress is computed from check-in data (not stored separately)
- Progress milestones:
  - ≥ 80% → status: `Nearing Completion`
  - 100% → status: `Achieved`
- Paginated goals list (`setGoalsPage`)

**Statistic Dashboard** (`/stats`)
- Overall metrics: % of habits completed today, active habit count, habits at risk of breaking a streak (streak < 3 days)
- Per-category distribution of active habits
- All stats are computed from raw slice data; nothing is duplicated in the store
- Calendar heatmap visualizing daily check-in activity and habit completion density, built in `CalendarHeatMap.jsx` using check-in dates from the store
- Per-habit stats table grouped by category: Current Streak, Longest Streak, Total Completions, and 7-day Completion Rate
- JSON export for downloading all habits, check-ins, and goals as `habit-data.json`
- Weekly progress line chart by category, showing daily completion rates (%) across the week

**Responsive Layout**
- Layout adapts to different screen sizes; sidebar collapses on smaller screens

---

## Tech Stack
| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | ^19.2 |
| State Management | Redux Toolkit + React Redux | ^2.12 / ^9.3 |
| Routing | React Router DOM | ^7.17 |
| Styling | Tailwind CSS v4 | ^4.3 |
| Component Primitives | Radix UI (Dialog, Select, Switch, Label, Slot) | various |
| Icons | Lucide React | ^1.18 |
| Notifications | Sonner | ^2.0 |
| Date Utilities | date-fns | ^4.4 |
| Build Tool | Vite | ^8.0 |

---

## Project Structure
```
src/
├── app/
│   ├── store.js                 # Redux store config + localStorage subscribe
    └── rootReducer.js           # Root reducer combining all slices
├── components/
│   ├── domain/                  # Feature-specific components (HabitForm, CheckInCard, GoalCard…)
│   ├── layout/                  # App shell and sidebar
│   ├── shared/                  # Reusable UI blocks (CalendarHeatMap, MetricCard, ProgressBar…)
│   └── ui/                      # Low-level primitives (Button, Badge, Dialog, Select…)
├── constants/                   # Shared enums: categories, priorities, statuses, units
├── data/                        # Seed JSON files + seedData.js loader
├── features/
│   ├── habits/habitSlice.js     # Habits slice (list, filters, lastAction)
│   ├── checkins/checkinSlice.js # Check-ins slice (list, lastAction)
│   ├── goals/goalsSlice.js      # Goals slice (list, goalsPage)
│   └── statistics/              # statisticSelectors.js (createSelector for overview stats)
├── hooks/                       # useDebounce, useLocalStorage
├── pages/                       # Route-level components (one per page)
├── services/
│   ├── exportService.js         # JSON export via Blob download
│   └── localStorageService.js   # loadState / saveState / clearState
├── styles/                      # Global CSS, Tailwind base, CSS variables
└── utils/
    ├── analyticsUtils.js        # Per-habit derived values (streak, goal progress, daily summary)
    ├── statisticsUtils.js       # Page-level aggregations (category distribution, heatmap data)
    ├── dateUtils.js             # Date helpers
    ├── streakUtils.js           # Streak calculation helpers
    └── validationUtils.js       # Input validation rules
```

Key architectural decisions:

- **Slices** (`features/`) store only raw, source-of-truth data — no computed values stored in Redux.
- **Utils** (`utils/`) compute all derived values (streaks, completion rates, goal progress) on the fly from slice data. This satisfies Advanced Challenge #6: avoiding duplicated state.
- **Components** (`components/`) are split by scope — `domain/` components know about habits and check-ins; `shared/` components are reusable across pages; `ui/` primitives have no business logic at all.
- **Services** (`services/`) handle side effects — reading/writing localStorage and triggering file downloads — keeping that logic out of components and slices.

---

## State Structure
The Redux store has 3 slices, each owning one data domain. The core design rule is no derived state in the store — streaks, completion rates, goal progress, and dashboard statistics are always computed from raw slice data on demand, never cached in Redux.

This approach avoids 2 common bugs: stale computed values (where the source data updates but the cached result does not) and duplicated state (where the same fact is stored in 2 places that can drift out of sync). The trade-off is a small amount of extra computation on each render, which is acceptable given the data volumes in this app.

### `habits` slice — `src/features/habits/habitSlice.js`

```js
habits: {
  list: [
    {
      id: "hb1",
      name: "Drink water",
      category: "Health",
      frequency: "Daily",
      daysOfWeek: [1, 3, 5],
      targetPerDay: 8,
      targetUnit: "cups",
      priority: "High",
      status: "Active",
      pausedAt: null,
      archivedAt: null,
      createdAt: "2026-05-01T00:00:00Z"
    }
  ],
  filters: {
    category: "",
    priority: "",
    status: "",
    frequency: ""
  },
  lastAction: null
}
```

**Actions:** `addHabit`, `updateHabit`, `deleteHabit`, `undoLastHabitAction`, `setFilter`

---

### `checkins` slice — `src/features/checkins/checkinSlice.js`

```js
checkins: {
  list: [
    {
      id: "ci1",
      habitId: "hb1",
      date: "2026-06-08",
      completedCount: 8,
      status: "Completed",
      createdAt: "2026-06-08T09:00:00Z"
    }
  ],
  lastAction: null
}
```

**Actions:** `addCheckin`, `updateCheckin`, `undoLastCheckinAction`

---

### `goals` slice — `src/features/goals/goalsSlice.js`
```js
goals: {
  list: [
    {
      id: "gl1",
      habitId: "hb1",
      targetType: "Streak",
      targetValue: 30,
      createdAt: "2026-05-01T00:00:00Z"
    }
  ],
  goalsPage: 1 
}
```

**Actions:** `addGoal`, `updateGoal`, `deleteGoal`, `setGoalsPage`

---

### Derived State & Utility Functions
All computed values are calculated on the fly from raw slice data. Nothing is stored in Redux for derived values. Computed on demand from raw slice data:

- Check-in status calculation
- Goal progress calculation
- Daily check-in summary generation
- Streak statistics
- 7-day completion rates
- Category distributions
- Dashboard metrics
- Calendar heatmap activity data

---

### Data Persistence

- Application state is persisted in `localStorage`
- State is loaded automatically on startup and saved after every Redux update
- Resetting storage restores the application to its initial seed data

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/NAB-F-Team/habit-tracker.git
cd habit-tracker

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

---

## Known Limitation

**1. No user authentication**
There is no login system. All data belongs to whoever uses the browser. Multiple users sharing one device will see each other's habits.

**2. localStorage only**
Data is stored in `localStorage` under the key `habitTracker:v1`. Clearing browser storage or switching browsers erases all data. There is no cloud backup or sync.

**3. Undo scope**
`undoLastHabitAction` and `undoLastCheckinAction` each track only the single most recent action. Refreshing the page clears the undo history.

**4. Date uses device clock**
All check-in dates are derived from `new Date()` on the user's device. Changing the system timezone or crossing midnight mid-session can cause unexpected day boundaries.

**5. No import for exported data**
The JSON export (`habit-data.json`) is for backup only. There is no corresponding import function to load that file back into the app.

**6. Category list is fixed**
Available categories (`Health`, `Study`, `Work`, `Mindfulness`, `Fitness`, `Other`) are defined in `src/constants/categories.js` and cannot be changed from the UI.

**7. Goal types limited at creation**
The `targetType` field currently supports `"Streak"` and `"Total Completions"` via the UI constants.

**8. No offline / PWA support**
The app is not configured as a Progressive Web App and will not function without an internet connection on first load.