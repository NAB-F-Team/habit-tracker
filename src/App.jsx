import { Routes, Route } from "react-router-dom";
import HabitsPage from "./pages/HabitsPage";
import DashboardPage from "./pages/DashboardPage";
import SettingPage from "./pages/SettingPage";
import DailyCheckinPage from "./pages/DailyCheckinPage";

function App() {
  return (
    //Nhã: mấy component này chưa viết export function nên nó lỗi
    <Routes>
      <Route path="/" element={<DailyCheckinPage />} />

      <Route path="/habits" element={<HabitsPage />} />

      <Route path="/goals" element={<GoalsPage />} />

      <Route path="/dashboard" element={<DashboardPage />} />

      <Route path="/settings" element={<SettingPage />} />
    </Routes>
  );
}

export default App;
