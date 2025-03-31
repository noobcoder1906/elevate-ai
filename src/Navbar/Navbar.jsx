import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./navbar.css";


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="navbar">
      <div className="logo">
        <img src="/logo2.png" alt="Elevate Logo" />
      </div>
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
      <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
        {/* <Link to="/">Login</Link>
        <Link to="/signup">Signup</Link> */}
        <Link to="/Home">Home</Link>
        <Link to="/Chatbot">Express</Link>
        <Link to= "/log">Log</Link>
        <Link to="/ForumBook">FAQ</Link>
        <Link to="/QuizPage">Quiz</Link>
        <Link to="/Profile">Profile</Link>

      </div>
    </div>
  );
};

export default Navbar;