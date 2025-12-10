import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/signUp";
import Login from "./pages/Login";
import Home from "./pages/home";
import ClientDashboard from "./pages/Client"
import InstructorDashboard from "./pages/instructor"
import Workouts from "./components/instructor/workouts";
import SessionsPage from "./components/instructor/allSessions";
import ProfileLoader from "./routes/profileRoutes";
import AdminDashboard from "./pages/admin";
import DieticianList from "./components/admin/dieticianLists";
import InstructorList from "./components/admin/instructorList";
import ClientList from "./components/admin/clientsList";
import { ToastContainer } from "react-toastify";
import ClientsPage from "./components/ClientsView";
import DieticiansDashboard from "./pages/dieticianDashboards";
import { ModalProvider } from "./contexts/modalContext";
import MealPlans from "./components/dietician/mealPlans/mealPlans";
import Chatbot from "./components/chatbot";


const App: React.FC = () => {
  return (
    <Router>
          <ToastContainer position="top-right" autoClose={2500} />
         <ModalProvider>
          <Chatbot />
      <Routes>

        <Route path="/" element={<Home />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/client" element={<ClientDashboard />} />
         <Route path="/dietician" element={<DieticiansDashboard />} />
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/instructors" element={<InstructorList />} />
        <Route path="/admin/dieticians" element={<DieticianList />} />
        <Route path="/admin/clients" element={<ClientList />} />
         <Route path="clientsView" element={<ClientsPage />} />
     
        <Route
          path="/complete-profile"
          element={<ProfileLoader />} 
        />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/sessions" element={<SessionsPage />} />

       <Route path="/meal-plans" element={<MealPlans />} />
      </Routes>
      </ModalProvider>
    </Router>
  );
};

export default App;
