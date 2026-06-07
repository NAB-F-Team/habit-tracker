import { Routes, Route } from "react-router-dom";

function App() {

  return (

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
        element={<SettingsPage />}
      />

    </Routes>

  );

}

export default App;
