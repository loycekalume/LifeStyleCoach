import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/signUp";   
import Login from "./pages/Login";    
import Home from "./pages/home";
import ClientDashboard from "./pages/Client"

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Home />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/client" element={<ClientDashboard/>}/>

      </Routes>
    </Router>
  );
};

export default App;

