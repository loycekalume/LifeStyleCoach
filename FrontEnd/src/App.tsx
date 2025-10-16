import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/signUp";   
import Login from "./pages/Login";    
import DieticianList from "./components/DieticianList";
import Client from "./pages/Client";
import Chatbot from "./components/chatbot";

const App: React.FC = () => {
  return (
    // <Router>
    //   <Routes>
        
    //     <Route path="/" element={<Navigate to="/login" replace />} />

    //     {/* Auth pages */}
    //     <Route path="/login" element={<Login />} />
    //     <Route path="/signup" element={<Signup />} />

    //   </Routes>
    // </Router>

   <Chatbot />
  );
};

export default App;
