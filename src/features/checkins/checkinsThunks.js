import { addCheckin, updateCheckin } from './checkinSlice';
import { setGoalNotification } from '../goals/goalsSlice';
import { getGoalProgress } from '../../utils/analyticsUtils';


export const addCheckinWithGoalCheck = (checkin, undoId) => (dispatch, getState) => {

  dispatch(addCheckin({ checkin, undoId }));


  const state = getState();
  const allGoals = state.goals.list;
  const allHabits = state.habits.list;
  const allCheckins = state.checkins.list;


  const relatedGoals = allGoals.filter(goal => goal.habitId === checkin.habitId);

  if (relatedGoals.length === 0) return;


  relatedGoals.forEach(goal => {
    const habit = allHabits.find(h => h.id === goal.habitId);
    if (!habit) return;

    const goalData = getGoalProgress(goal, habit, allCheckins);


    if (goalData.status === "Nearing Completion" || goalData.status === "Achieved") {
      dispatch(setGoalNotification({
        goal: goalData.goal,
        habit: goalData.habit,
        status: goalData.status,
        progress: goalData.progress,
        current: goalData.current
      }));
    }
  });
};


export const updateCheckinWithGoalCheck = (checkin, undoId) => (dispatch, getState) => {
  dispatch(updateCheckin({ checkin, undoId }));

  const state = getState();
  const allGoals = state.goals.list;
  const allHabits = state.habits.list;
  const allCheckins = state.checkins.list;

  const relatedGoals = allGoals.filter(goal => goal.habitId === checkin.habitId);

  relatedGoals.forEach(goal => {
    const habit = allHabits.find(h => h.id === goal.habitId);
    if (!habit) return;

    const goalData = getGoalProgress(goal, habit, allCheckins);

    if (goalData.status === "Nearing Completion" || goalData.status === "Achieved") {
      dispatch(setGoalNotification({
        goal: goalData.goal,
        habit: goalData.habit,
        status: goalData.status,
        progress: goalData.progress,
        current: goalData.current
      }));
    }
  });
};
