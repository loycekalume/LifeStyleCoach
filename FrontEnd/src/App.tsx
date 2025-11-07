import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/signUp";   
import Login from "./pages/Login";    
import Home from "./pages/home";
import ClientDashboard from "./pages/Client"
import InstructorDashboard from "./pages/instructor"

const App: React.FC = () => {
  return (
    // <Router>
    //   <Routes>
        
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/client" element={<ClientDashboard/>}/>
         <Route path="/instructor" element={<InstructorDashboard/>}/>

    //   </Routes>
    // </Router>

  );
};

export default App;

