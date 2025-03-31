import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import '../styles/Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
   
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  // Validation Functions

  const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, phone, address, panNumber, aadhaarNumber, username, password, confirmPassword } = formData;

    // Form Validations
    if (!username.trim()) return setErrorMessage("Username cannot be empty.");
    
    if (!isValidPhone(phone)) return setErrorMessage("Invalid Phone Number.");
    if (password.length < 6) return setErrorMessage("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setErrorMessage("Passwords do not match!");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        phone,
        address,
        username,
        uid: user.uid,
      });

      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Signup Error:", error);
      setErrorMessage(error.message);
    }
  };

  const handlePopupClose = () => {
    setShowSuccessPopup(false);
    navigate('/login');
  };

  return (
    <motion.div 
      className="auth-container"
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="logo-container">
        <motion.img 
          src="/logo2.png" 
          alt="EthoScore Logo" 
          className="logo" 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ duration: 0.5 }}
        />
      </div>

      <h2 className="auth-title">Signup</h2>
      <motion.form 
        onSubmit={handleSubmit} 
        className="auth-form"
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {[
          { label: "Full Name", name: "fullName", type: "text", placeholder: "Enter your full name" },
          { label: "Email", name: "email", type: "email", placeholder: "Enter your email" },
          { label: "Username", name: "username", type: "text", placeholder: "Create a username" },
          { label: "Phone Number", name: "phone", type: "tel", placeholder: "Enter your phone number" },
          { label: "Address", name: "address", type: "text", placeholder: "Enter your address" },
          { label: "Password", name: "password", type: "password", placeholder: "Create a password" },
          { label: "Confirm Password", name: "confirmPassword", type: "password", placeholder: "Confirm your password" },
        ].map((field, index) => (
          <motion.div 
            key={index} 
            className="auth-input-group"
            whileFocus={{ scale: 1.02 }}
          >
            <label>{field.label}:</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder={field.placeholder}
            />
          </motion.div>
        ))}

        <div className="link-container">
          <p>Have an account? <span className="link" onClick={() => navigate('/')}>Login</span></p>
        </div>

        <motion.button 
          type="submit" 
          className="auth-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Signup
        </motion.button>
      </motion.form>

      {errorMessage && (
        <motion.div 
          className="error-popup"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="error-popup-content">
            <span className="error-popup-close" onClick={() => setErrorMessage('')}>×</span>
            <h3>Error</h3>
            <p>{errorMessage}</p>
            <button className="error-popup-button" onClick={() => setErrorMessage('')}>Close</button>
          </div>
        </motion.div>
      )}

      {showSuccessPopup && (
        <motion.div 
          className="success-popup"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="success-popup-content">
            <h3>Account Created Successfully!</h3>
            <p>Welcome to the banking platform. Your account has been successfully created.</p>
            <motion.button 
              className="success-popup-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePopupClose}
            >
              Proceed to Login
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Signup;
