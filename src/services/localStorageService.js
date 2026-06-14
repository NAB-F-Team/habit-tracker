import { seedData } from "../data/seedData";

const STORAGE_KEY = "habitTracker:v1";

const createDefaultState = () => ({
  habits: {
    list: seedData.habits,
    filters: {
      category: "",
      priority: "",
      status: ""
    }
  },
  checkins: {
    list: seedData.checkins,
    lastAction: null
  },
  goals: {
    list: seedData.goals
  }
});

const hasList = (section) => section && Array.isArray(section.list);

const normalizeState = (state) => {
  if (!state || typeof state !== "object") {
    return undefined;
  }

  const defaults = createDefaultState();

  return {
    habits: hasList(state.habits)
      ? {
          ...defaults.habits,
          ...state.habits,
          filters: {
            ...defaults.habits.filters,
            ...(state.habits.filters ?? {})
          }
        }
      : defaults.habits,
    checkins: hasList(state.checkins)
      ? {
          ...defaults.checkins,
          ...state.checkins
        }
      : defaults.checkins,
    goals: hasList(state.goals)
      ? {
          ...defaults.goals,
          ...state.goals
        }
      : defaults.goals
  };
};

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);

    if (!serializedState) {
      return undefined;
    }

    return normalizeState(JSON.parse(serializedState));
  } catch {
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    const persistedState = {
      habits: state.habits,
      checkins: state.checkins,
      goals: state.goals
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  } catch (error) {
    console.log(error);
  }
};

export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.log(error);
  }
};
