import { Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import HabitsPage from "./pages/HabitsPage";
import StatisticsPage from "./pages/StatisticsPage";
import GoalsPage from "./pages/GoalsPage";
import SettingPage from "./pages/SettingPage";
import DailyCheckinPage from "./pages/DailyCheckinPage";

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DailyCheckinPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/stats" element={<StatisticsPage />} />
        <Route path="/settings" element={<SettingPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
