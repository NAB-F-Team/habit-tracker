import { Routes, Route } from "react-router-dom";
import HabitsPage from "./pages/HabitsPage";
import DashboardPage from "./pages/DashboardPage";
import SettingPage from "./pages/SettingPage";
import Home from "./pages/Home";

function App() {

  return (
    //Nhã: mấy component này chưa viết export function nên nó lỗi
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />


      <Route
        path="/habits"
        element={<HabitsPage />}
      />

      <Route
        path="/dashboard"
        element={<DashboardPage />}
      />

      <Route
        path="/settings"
        element={<SettingPage />}
      />

    </Routes>

  );

}

export default App;
