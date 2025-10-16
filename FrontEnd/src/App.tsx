import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/signUp";   
import Login from "./pages/Login";    

const App: React.FC = () => {
  return (
    // <Router>
    //   <Routes>
        
        <Route path="/" element={<Navigate to="/login" replace />} />

    //     {/* Auth pages */}
    //     <Route path="/login" element={<Login />} />
    //     <Route path="/signup" element={<Signup />} />

    //   </Routes>
    // </Router>

  );
};

export default App;
