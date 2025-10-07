import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Instructor from "./pages/instructor";
import Workouts from "./components/instructor/workouts";
import SessionsPage from "./components/instructor/allSessions";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Instructor />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/sessions" element={<SessionsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
