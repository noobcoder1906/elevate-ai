import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email && !username) {
      setError('Email or Username is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      let userCredential;

      if (email) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userSnapshot = await getDoc(doc(db, 'users', username));
        if (!userSnapshot.exists()) {
          setError('Username not found');
          return;
        }
        const user = userSnapshot.data();
        userCredential = await signInWithEmailAndPassword(auth, user.email, password);
      }

      navigate('/home');
    } catch (error) {
      setError('Invalid credentials');
      setEmailError(true);
      setPasswordError(true);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert('Password reset email sent!');
      setIsResetMode(false);
    } catch (error) {
      setError('Error sending password reset email');
    }
  };

  return (
    <motion.div
      className="auth-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="auth-container">
        <div className="logo-container">
          <img src="/logo2.png" alt="Elevate Logo" className="logo" />
        </div>

        <h2 className="auth-title">Login</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className={`auth-input-group ${emailError ? 'error' : ''}`}>
            <label>{username ? 'Username' : 'Email'}:</label>
            <input
              type="text"
              value={username ? username : email}
              onChange={(e) => (username ? setUsername(e.target.value) : setEmail(e.target.value))}
              required
              className="auth-input"
              placeholder={`Enter your ${username ? 'username' : 'email'}`}
            />
          </div>

          <div className={`auth-input-group ${passwordError ? 'error' : ''}`}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="auth-button">Login</button>

          <div className="forgot-password-container">
            <span className="forgot-password-link" onClick={() => setIsResetMode(true)}>
              Forgot Password?
            </span>
          </div>
        </form>

        {error && (
          <div className="error-popup">
            <div className="error-popup-content">
              <span className="error-popup-close" onClick={() => setError(null)}>×</span>
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {isResetMode && (
          <div className="reset-modal">
            <div className="reset-modal-content">
              <h3>Reset Password</h3>
              <input
                type="email"
                placeholder="Enter your email address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <button onClick={handlePasswordReset}>Send Reset Link</button>
              <button onClick={() => setIsResetMode(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="link-container">
          <p>Don't have an account? <span className="link" onClick={() => navigate('/signup')}>Sign up</span></p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
