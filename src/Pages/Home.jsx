import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { auth, onAuthStateChanged } from "../firebase";
import Navbar from "../Navbar/Navbar";
import "./Home.css";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const Home = () => {
  const [userDetails, setUserDetails] = useState({ 
    username: localStorage.getItem("username") || null, 
    avatarUrl: localStorage.getItem("avatarUrl") || "/default-avatar.png" 
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scratched, setScratched] = useState(false);
  const [thoughtOfTheDay, setThoughtOfTheDay] = useState("");
  const [typedText, setTypedText] = useState("");
  const [notes, setNotes] = useState([]);
  const [moodStats, setMoodStats] = useState({
    positiveCount: 0,
    negativeCount: 0,
    recentMood: null,
    moodTrend: null,
    moodHistory: []
  });
  const [showMeditationTimer, setShowMeditationTimer] = useState(false);
  const [meditationTime, setMeditationTime] = useState(300); // 5 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [completedActivities, setCompletedActivities] = useState(() => {
    const saved = localStorage.getItem("completedActivities");
    return saved ? JSON.parse(saved) : [];
  });
  const [streakCount, setStreakCount] = useState(() => {
    const saved = localStorage.getItem("streakCount");
    return saved ? parseInt(saved) : 0;
  });
  const canvasRef = useRef(null);
  const timerRef = useRef(null);

  const thoughts = [
    "Take a deep breath. You are doing your best!",
    "Every day is a fresh start.",
    "You are capable of amazing things.",
    "Believe in yourself and your dreams.",
    "Progress, not perfection, matters most.",
    "Your feelings are valid, but they don't define you.",
    "Small steps lead to big changes.",
    "Be gentle with yourself today."
  ];

  const wellnessActivities = [
    { id: 1, title: "5-Minute Meditation", icon: "🧘", description: "Take a few minutes to center yourself" },
    { id: 2, title: "Gratitude Journal", icon: "📝", description: "Write down three things you're grateful for" },
    { id: 3, title: "Stretching Break", icon: "🤸", description: "Stretch your body for 2 minutes" },
    { id: 4, title: "Hydration Check", icon: "💧", description: "Drink a glass of water" }
  ];

  // Listen to auth state changes and update local storage accordingly
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const username = user.displayName || user.email;
        const avatarUrl = user.photoURL || "/default-avatar.png";
        setUserDetails({ username, avatarUrl });
        localStorage.setItem("username", username);
        localStorage.setItem("avatarUrl", avatarUrl);
      } else {
        setUserDetails({ username: null, avatarUrl: "/default-avatar.png" });
        localStorage.removeItem("username");
        localStorage.removeItem("avatarUrl");
      }
    });
    return () => unsubscribe();
  }, []);

  // Load journal entries from session storage
  useEffect(() => {
    const storedNotes = sessionStorage.getItem("logs");
    if (storedNotes) {
      const parsedNotes = JSON.parse(storedNotes);
      setNotes(parsedNotes);
      analyzeMoodData(parsedNotes);
    }
  }, []);

  // Save completed activities to localStorage
  useEffect(() => {
    localStorage.setItem("completedActivities", JSON.stringify(completedActivities));
  }, [completedActivities]);

  // Save streak count to localStorage
  useEffect(() => {
    localStorage.setItem("streakCount", streakCount.toString());
  }, [streakCount]);

  // Check if a new day has started to reset activities
  useEffect(() => {
    const lastLogin = localStorage.getItem("lastLoginDate");
    const today = new Date().toDateString();
    
    if (lastLogin && lastLogin !== today) {
      // It's a new day
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if user had activity yesterday to maintain streak
      const yesterdayStr = yesterday.toDateString();
      const hadActivityYesterday = localStorage.getItem("hadActivityOn_" + yesterdayStr);
      
      if (hadActivityYesterday) {
        // Maintain or increase streak
        setStreakCount(prev => prev + 1);
      } else {
        // Reset streak
        setStreakCount(0);
      }
      
      // Reset completed activities for the new day
      setCompletedActivities([]);
    }
    
    // Mark today's login
    localStorage.setItem("lastLoginDate", today);
  }, []);

  // Set the "Thought of the Day"
  useEffect(() => {
    const lastScratched = localStorage.getItem("lastScratchedDate");
    const today = new Date().toDateString();
    
    if (lastScratched === today) {
      // User already scratched today, show the thought
      setScratched(true);
      const savedThought = localStorage.getItem("dailyThought");
      if (savedThought) {
        setThoughtOfTheDay(savedThought);
      }
    } else {
      // New day, new thought
      const index = new Date().getDate() % thoughts.length;
      setThoughtOfTheDay(thoughts[index]);
      localStorage.setItem("dailyThought", thoughts[index]);
      setScratched(false);
    }
  }, []);

  // Animate the welcome message with the user's username
  useEffect(() => {
    if (!userDetails.username) {
      setTypedText("");
      return;
    }
    
    const welcomeText = `HWelcome, ${userDetails.username}!`;
    let index = 0;
    setTypedText("");
    
    const intervalId = setInterval(() => {
      setTypedText((prev) => prev + welcomeText.charAt(index));
      index++;
      if (index >= welcomeText.length) {
        clearInterval(intervalId);
      }
    }, 100);
    
    return () => clearInterval(intervalId);
  }, [userDetails.username]);

  // Initialize the scratch canvas effect
  useEffect(() => {
    if (!canvasRef.current || scratched) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#f9d976");
    gradient.addColorStop(1, "#f39f86");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    ctx.globalCompositeOperation = "source-over";
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Scratch here for today's motivation", canvas.width / 2, canvas.height / 2);
    
    // Set up for scratch effect
    ctx.globalCompositeOperation = "destination-out";

    const handleScratch = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
      checkScratchProgress(ctx, canvas);
    };

    const handleTouchScratch = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
      checkScratchProgress(ctx, canvas);
    };

    canvas.addEventListener("mousemove", handleScratch);
    canvas.addEventListener("touchmove", handleTouchScratch);
    
    return () => {
      canvas.removeEventListener("mousemove", handleScratch);
      canvas.removeEventListener("touchmove", handleTouchScratch);
    };
  }, [scratched]);

  // Manage meditation timer
  useEffect(() => {
    if (isTimerActive && meditationTime > 0) {
      timerRef.current = setInterval(() => {
        setMeditationTime(prev => prev - 1);
      }, 1000);
    } else if (meditationTime === 0) {
      setIsTimerActive(false);
      completeActivity(1); // Mark meditation as completed
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, meditationTime]);

  // Analyze mood data from journal entries
  const analyzeMoodData = (journalEntries) => {
    if (!journalEntries || journalEntries.length === 0) {
      setMoodStats({
        positiveCount: 0,
        negativeCount: 0,
        recentMood: null,
        moodTrend: null,
        moodHistory: []
      });
      return;
    }

    try {
      // Count positive and negative entries
      const positiveEntries = journalEntries.filter(note => note?.sentiment === 1);
      const negativeEntries = journalEntries.filter(note => note?.sentiment === 0);
      const positiveCount = positiveEntries.length;
      const negativeCount = negativeEntries.length;
      
      // Get most recent mood
      const recentMood = journalEntries[0]?.sentiment;
      
      // Calculate mood trend (last 5 entries)
      const recentEntries = journalEntries.slice(0, Math.min(5, journalEntries.length));
      let moodTrend = null;
      
      if (recentEntries.length >= 3) {
        const validEntries = recentEntries.filter(note => note?.sentiment !== undefined);
        if (validEntries.length >= 3) {
          const positiveRecent = validEntries.filter(note => note.sentiment === 1).length;
          const negativeRecent = validEntries.filter(note => note.sentiment === 0).length;
          
          if (positiveRecent > negativeRecent * 1.5) {
            moodTrend = "improving";
          } else if (negativeRecent > positiveRecent * 1.5) {
            moodTrend = "declining";
          } else {
            moodTrend = "stable";
          }
        }
      }
      
      // Create mood history data for chart
      const moodHistory = journalEntries.slice(0, 7).reverse().map((entry, index) => {
        return {
          day: index,
          date: entry.date,
          mood: entry.sentiment === 1 ? 100 : entry.sentiment === 0 ? 0 : 50
        };
      });
      
      setMoodStats({
        positiveCount,
        negativeCount,
        recentMood,
        moodTrend,
        moodHistory
      });
    } catch (error) {
      console.error("Error analyzing mood data:", error);
      setMoodStats({
        positiveCount: 0,
        negativeCount: 0,
        recentMood: null,
        moodTrend: null,
        moodHistory: []
      });
    }
  };

  // Check if the canvas is scratched enough to reveal the daily thought
  const checkScratchProgress = (ctx, canvas) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let clearedPixels = 0;
    
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] === 0) clearedPixels++;
    }
    
    if (clearedPixels / (canvas.width * canvas.height) > 0.4) {
      setScratched(true);
      localStorage.setItem("lastScratchedDate", new Date().toDateString());
      
      // Mark activity for streak calculation
      const today = new Date().toDateString();
      localStorage.setItem("hadActivityOn_" + today, "true");
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle meditation timer
  const toggleTimer = () => {
    if (isTimerActive) {
      setIsTimerActive(false);
    } else {
      setIsTimerActive(true);
    }
  };

  // Reset meditation timer
  const resetTimer = () => {
    setIsTimerActive(false);
    setMeditationTime(300); // Reset to 5 minutes
  };

  // Mark an activity as completed
  const completeActivity = (activityId) => {
    if (!completedActivities.includes(activityId)) {
      const newCompleted = [...completedActivities, activityId];
      setCompletedActivities(newCompleted);
      
      // Mark activity for streak calculation
      const today = new Date().toDateString();
      localStorage.setItem("hadActivityOn_" + today, "true");
      
      // If first activity today, and we haven't already updated streak today
      const lastStreakUpdate = localStorage.getItem("lastStreakUpdate");
      if (completedActivities.length === 0 && lastStreakUpdate !== today) {
        setStreakCount(prev => prev + 1);
        localStorage.setItem("lastStreakUpdate", today);
      }
    }
  };

  // Get mood emoji based on sentiment
  const getMoodEmoji = () => {
    if (moodStats.recentMood === 1) return "😊";
    if (moodStats.recentMood === 0) return "😔";
    return "😐";
  };

  // Get mood trend description
  const getMoodTrendText = () => {
    switch (moodStats.moodTrend) {
      case "improving":
        return "Your mood seems to be improving. Keep it up!";
      case "declining":
        return "Your mood has been a bit low recently. Consider some self-care activities.";
      case "stable":
        return "Your mood has been stable recently.";
      default:
        return "Start journaling to track your mood patterns.";
    }
  };

  // Get trend icon
  const getTrendIcon = () => {
    switch (moodStats.moodTrend) {
      case "improving": return "↗️";
      case "declining": return "↘️";
      case "stable": return "→";
      default: return "";
    }
  };

  return (
    <div className="home-page">
      <Navbar 
        username={userDetails.username} 
        avatarUrl={userDetails.avatarUrl} 
        toggleDropdown={() => setDropdownOpen(!dropdownOpen)} 
        dropdownOpen={dropdownOpen} 
        handleLogout={() => console.log("Logging out...")} 
      />

      <div className="home-container">
        {/* Welcome Section */}
        <motion.div 
          className="welcome-section"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="user-welcome">
            <img 
              src={userDetails.avatarUrl} 
              alt="User Avatar" 
              className="user-avatar"
            />
            <h1>
              {typedText || "Welcome!"} 
              <span className="mood-emoji">{getMoodEmoji()}</span>
            </h1>
          </div>
          
          {streakCount > 0 && (
            <div className="streak-counter">
              <span className="streak-flame">🔥</span>
              <span className="streak-count">{streakCount}</span>
              <span className="streak-label">day streak</span>
            </div>
          )}
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Daily Motivation Card */}
          <motion.div 
            className="dashboard-card scratch-card-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2>Daily Motivation</h2>
            <div className={`scratch-card ${scratched ? 'revealed' : ''}`}>
              {!scratched ? (
                <canvas 
                  ref={canvasRef} 
                  className="scratch-overlay"
                ></canvas>
              ) : (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  transition={{ duration: 0.5 }}
                >
                  <p className="quote-text">{thoughtOfTheDay}</p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Mood Insights Card */}
          <motion.div 
            className="dashboard-card mood-summary-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2>Your Mood Insights</h2>
            
            {notes.length > 0 ? (
              <div className="mood-summary">
                <div className="mood-stats">
                  <div className="mood-stat positive">
                    <span className="stat-value">{moodStats.positiveCount}</span>
                    <span className="stat-label">Positive Entries</span>
                  </div>
                  <div className="mood-stat negative">
                    <span className="stat-value">{moodStats.negativeCount}</span>
                    <span className="stat-label">Negative Entries</span>
                  </div>
                </div>
                
                <div className="mood-trend">
                  <h3>Recent Mood {getTrendIcon()}</h3>
                  <p>{getMoodTrendText()}</p>
                </div>
                
                {moodStats.moodHistory.length > 0 && (
                  <div className="mood-chart">
                    <h3>Mood History</h3>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={moodStats.moodHistory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => value.split(',')[0]}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tick={false}
                          label={{ value: 'Mood', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                        />
                        <Tooltip 
                          formatter={(value) => [`Mood: ${value === 100 ? 'Positive' : value === 0 ? 'Negative' : 'Neutral'}`]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="#4e73df" 
                          strokeWidth={2}
                          dot={{ fill: '#4e73df', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                <Link to="/log" className="add-entry-btn">Journal Now</Link>
              </div>
            ) : (
              <div className="empty-mood">
                <p>Start tracking your emotional well-being by keeping a journal.</p>
                <p className="empty-subtitle">Our AI-powered sentiment analysis will help you gain insights into your mood patterns.</p>
                <Link to="/log" className="add-entry-btn">Start Journaling</Link>
              </div>
            )}
          </motion.div>

          {/* Quick Wellness Activities Card */}
          <motion.div 
            className="dashboard-card wellness-activities-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2>Wellness Activities</h2>
            <div className="activities-list">
              {wellnessActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className={`activity-item ${completedActivities.includes(activity.id) ? 'completed' : ''}`}
                  onClick={() => {
                    if (activity.id === 1) {
                      setShowMeditationTimer(true);
                    } else {
                      completeActivity(activity.id);
                    }
                  }}
                >
                  <div className="activity-icon">{activity.icon}</div>
                  <div className="activity-content">
                    <h3>{activity.title}</h3>
                    <p>{activity.description}</p>
                  </div>
                  {completedActivities.includes(activity.id) && (
                    <div className="completed-check">✓</div>
                  )}
                </div>
              ))}
            </div>
            
            {showMeditationTimer && (
              <div className="meditation-timer">
                <h3>Meditation Timer</h3>
                <div className="timer-display">{formatTime(meditationTime)}</div>
                <div className="timer-controls">
                  <button 
                    className={`timer-button ${isTimerActive ? 'pause' : 'start'}`}
                    onClick={toggleTimer}
                  >
                    {isTimerActive ? 'Pause' : 'Start'}
                  </button>
                  <button 
                    className="timer-button reset"
                    onClick={resetTimer}
                  >
                    Reset
                  </button>
                  <button 
                    className="timer-button close"
                    onClick={() => setShowMeditationTimer(false)}
                  >
                    Close
                  </button>
                </div>
                <p className="timer-tip">Take deep breaths. Focus on the present moment.</p>
              </div>
            )}
          </motion.div>
          
          {/* Resources Card */}
          <motion.div 
            className="dashboard-card resources-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2>Mental Wellness Resources</h2>
            <div className="resources-grid">
              <div className="resource-item">
                <div className="resource-icon">📖</div>
                <h3>Articles</h3>
                <p>Read expert advice on managing stress and anxiety</p>
              </div>
              <div className="resource-item">
                <div className="resource-icon">🎧</div>
                <h3>Podcasts</h3>
                <p>Listen to mental health professionals</p>
              </div>
              <div className="resource-item">
                <div className="resource-icon">🧠</div>
                <h3>Exercises</h3>
                <p>Cognitive exercises to boost mental wellness</p>
              </div>
              <div className="resource-item">
                <div className="resource-icon">📱</div>
                <h3>Community</h3>
                <p>Connect with others on similar journeys</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
export default Home;