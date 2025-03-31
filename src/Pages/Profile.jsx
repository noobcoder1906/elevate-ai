import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Search } from "lucide-react";
import Navbar from "../Navbar/Navbar";

const SettingsPage = () => {
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState({
    name: localStorage.getItem("name") || "",
    email: localStorage.getItem("email") || "",
    avatarUrl: localStorage.getItem("avatarUrl") || "/default-avatar.png",
  });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

 
const API_KEY = import.meta.env.VITE_SEARCH_API_KEY;
const SEARCH_ENGINE_ID = import.meta.env.VITE_SEARCH_ENGINE_ID;

  // Initialize user data on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setUserId(user.uid);
          
          // Get basic user info
          const name = user.displayName || localStorage.getItem("name") || "";
          const email = user.email || localStorage.getItem("email") || "";
          const avatarUrl = user.photoURL || localStorage.getItem("avatarUrl") || "/default-avatar.png";
          
          // Update state and localStorage
          setUserDetails({ name, email, avatarUrl });
          localStorage.setItem("name", name);
          localStorage.setItem("email", email);
          localStorage.setItem("avatarUrl", avatarUrl);

          // Get additional user details from Firestore
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            
            // Update user details with Firestore data
            setUserDetails(prev => ({
              ...prev,
              avatarUrl: data.avatarUrl || avatarUrl,
            }));
            
            // Update localStorage with Firestore data
            localStorage.setItem("avatarUrl", data.avatarUrl || avatarUrl);
            
            // Set additional state
            setIs2FAEnabled(data.is2FAEnabled || false);
            setIsDarkMode(data.isDarkMode || false);
          }
        } catch (error) {
          console.error("Error initializing user data:", error);
          alert("Error loading user data. Please try refreshing the page.");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUserDetailsChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        searchQuery
      )}&cx=${SEARCH_ENGINE_ID}&key=${API_KEY}&searchType=image`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error("Error searching images:", error);
      alert("Failed to search images. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAvatarSelect = (imageUrl) => {
    try {
      setSelectedAvatar(imageUrl);
      setUserDetails(prev => ({ ...prev, avatarUrl: imageUrl }));
      
      // Update localStorage immediately for instant feedback
      localStorage.setItem("avatarUrl", imageUrl);
    } catch (error) {
      console.error("Error selecting avatar:", error);
      alert("Failed to select avatar. Please try again.");
    }
  };

  const handleSaveChanges = async () => {
    if (!userId) {
      alert("No user logged in. Please log in and try again.");
      return;
    }

    setIsLoading(true);
    try {
      let avatarUrl = userDetails.avatarUrl;

      // Handle avatar upload if a new one was selected
      if (selectedAvatar) {
        try {
          const response = await fetch(selectedAvatar);
          if (!response.ok) throw new Error("Failed to fetch avatar image");
          
          const blob = await response.blob();
          const avatarRef = ref(storage, `avatars/${userId}`);
          await uploadBytes(avatarRef, blob);
          avatarUrl = await getDownloadURL(avatarRef);
        } catch (error) {
          console.error("Error uploading avatar to Firebase Storage:", error);
          // Fallback to using the direct URL
          avatarUrl = selectedAvatar;
        }
      }

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: userDetails.name,
        photoURL: avatarUrl,
      });

      // Update Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        name: userDetails.name,
        avatarUrl,
        is2FAEnabled,
        isDarkMode,
        lastUpdated: new Date().toISOString(),
      });

      // Update localStorage
      localStorage.setItem("name", userDetails.name);
      localStorage.setItem("avatarUrl", avatarUrl);

      // Update state
      setUserDetails(prev => ({
        ...prev,
        avatarUrl,
      }));

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAToggle = () => setIs2FAEnabled(prev => !prev);

  const handleDarkModeToggle = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      document.body.style.backgroundColor = newMode ? "#121212" : "#fff";
      document.body.style.color = newMode ? "#fff" : "#121212";
      return newMode;
    });
  };

  const handleBackToHome = () => navigate("/home");

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "#121212" : "#fff",
        color: isDarkMode ? "#fff" : "#121212",
        padding: "20px",
        overflow: "auto",
        maxHeight: "100vh",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "bold",
          marginBottom: "24px",
        }}
      >
        ⚙️ Settings & Profile
      </h1>

      {/* Avatar Section */}
      <div
        style={{
          backgroundColor: "#1E1E1E",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <Navbar />
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <img
            src={userDetails.avatarUrl || "/default-avatar.png"}
            alt="Profile"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
              marginRight: "20px",
            }}
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for avatar images..."
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor: "#2e2e2e",
                  color: "#fff",
                  marginRight: "10px",
                }}
              />
              <button
                onClick={handleImageSearch}
                disabled={isSearching || !searchQuery.trim()}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#36a2eb",
                  border: "none",
                  borderRadius: "4px",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  opacity: isSearching || !searchQuery.trim() ? 0.7 : 1,
                }}
              >
                <Search size={16} style={{ marginRight: "8px" }} />
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: "10px",
            }}
          >
            {searchResults.map((result, index) => (
              <img
                key={index}
                src={result.link}
                alt={result.title}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  cursor: "pointer",
                  border: userDetails.avatarUrl === result.link ? "2px solid #36a2eb" : "none",
                  borderRadius: "4px",
                }}
                onClick={() => handleAvatarSelect(result.link)}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* User Details Section */}
      <div
        style={{
          backgroundColor: "#1E1E1E",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>👤 User Details</h2>
        <form>
          <label style={{ display: "block", marginBottom: "8px", color: "#ccc" }}>
            Name
          </label>
          <input
            type="text"
            name="name"
            value={userDetails.name}
            onChange={handleUserDetailsChange}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              backgroundColor: "#2e2e2e",
              color: "#fff",
            }}
          />

          <label
            style={{
              display: "block",
              marginTop: "16px",
              marginBottom: "8px",
              color: "#ccc",
            }}
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            value={userDetails.email}
            disabled
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              backgroundColor: "#2e2e2e",
              color: "#ccc",
            }}
          />
        </form>
      </div>

      {/* 2FA Toggle Section */}
      <div
        style={{
          backgroundColor: "#1E1E1E",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>
          🔐 Two-Factor Authentication
        </h2>
        <p style={{ color: "#ccc" }}>
          Enable Two-Factor Authentication (2FA) for extra security.
        </p>
        <button
          onClick={handle2FAToggle}
          style={{
            padding: "10px 20px",
            backgroundColor: is2FAEnabled ? "#ff7f50" : "#36a2eb",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
        </button>
      </div>

      {/* Dark Mode Toggle Section */}
      <div
        style={{
          backgroundColor: "#1E1E1E",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>🌙 Dark Mode</h2>
        <p style={{ color: "#ccc" }}>
          Toggle dark mode for a more comfortable experience.
        </p>
        <button
          onClick={handleDarkModeToggle}
          style={{
            padding: "10px 20px",
            backgroundColor: isDarkMode ? "#ff7f50" : "#36a2eb",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>

      {/* Save Changes & Back Button Section */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          onClick={handleSaveChanges}
          disabled={isLoading}
          style={{
            padding: "12px 24px",
            marginRight: "10px",
            backgroundColor: "#28a745",
            borderRadius: "4px",
            color: "#fff",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={handleBackToHome}
          disabled={isLoading}
          style={{
            padding: "12px 24px",
            backgroundColor: "#36a2eb",
            borderRadius: "4px",
            color: "#fff",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;