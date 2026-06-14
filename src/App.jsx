import { Routes, Route, BrowserRouter } from "react-router-dom";
import HabitsPage from "./pages/HabitsPage";
import StatisticsPage from "./pages/StatisticsPage";
import SettingPage from "./pages/SettingPage";
import DailyCheckinPage from "./pages/DailyCheckinPage";
import GoalsPage from "./pages/GoalsPage";
import AppShell from "./components/layout/AppShell";

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DailyCheckinPage />} />

          <Route path="/habits" element={<HabitsPage />} />

          <Route path="/goals" element={<GoalsPage />} />

          <Route path="/stats" element={<StatisticsPage />} />

          <Route path="/settings" element={<SettingPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
