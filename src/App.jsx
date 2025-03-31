import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Chatbot from "./Pages/Chatbot";
import ForumBook from "./Pages/ForumBook"; // Import the ForumBook component
import QuizPage from "./Pages/QuizPage";
import Profile from "./Pages/Profile";
import Log from "../src/log/log"; // ✅ Fix: Import the Log component);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/Chatbot" element={<Chatbot />} />
        <Route path= "/log" element={<Log />} /> {/* ✅ Fix: Added this */}
        <Route path="/ForumBook" element={<ForumBook />} /> {/* ✅ Fix: Added this */}
        <Route path="/QuizPage" element={<QuizPage />} />
        <Route path="/Profile" element={<Profile />} />

      </Routes>
    </Router>
  );
};

export default App;
