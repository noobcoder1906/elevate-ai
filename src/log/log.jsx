import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Navbar from "../Navbar/Navbar";
import "./log.css";

const Log = ({ onNotesUpdate }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [filterType, setFilterType] = useState("all");

  // Load notes from session storage when component mounts
  useEffect(() => {
    const storedNotes = sessionStorage.getItem("logs");
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
  }, []);

  // Save notes to session storage whenever notes change
  useEffect(() => {
    sessionStorage.setItem("logs", JSON.stringify(notes));
    
    // If onNotesUpdate prop exists, call it with the updated notes
    if (onNotesUpdate) {
      onNotesUpdate(notes);
    }
  }, [notes, onNotesUpdate]);

  // Open new note form
  const handleAddNewNote = () => {
    setNewNote({ title: "", content: "" });
    setIsAdding(true);
    setSelectedNote(null);
    setApiError(null); // Clear any previous errors
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote((prevNote) => ({
      ...prevNote,
      [name]: value,
    }));
  };

  // Function to send text to the FastAPI server and get sentiment analysis
  const analyzeSentiment = async (text) => {
    setIsLoading(true);
    setApiError(null);
  
    try {
      // Replace with the actual API endpoint where your FastAPI is running
      const response = await axios.post("http://localhost:8000/predict-sentiment/", { text });
      setIsLoading(false);
      
      // Assuming the response has the sentiment label (1: Positive, 0: Negative, 0.5: Neutral)
      return response.data.predicted_sentiment === "Positive" ? 1 : response.data.predicted_sentiment === "Negative" ? 0 : 0.5;
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      setIsLoading(false);
      
      // Handle server connection issues gracefully
      if (error.code === 'ERR_CONNECTION_REFUSED' || error.code === 'ERR_NETWORK') {
        setApiError("Sentiment analysis server is not available. Saving with neutral sentiment.");
        return 0.5; // Use a neutral sentiment value
      } else {
        setApiError("Error in sentiment analysis. Saving with neutral sentiment.");
        return 0.5; // Use a neutral sentiment value
      }
    }
  };
  

  // Submit new note
  const handleSubmit = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
  
    setIsLoading(true);
    const sentiment = await analyzeSentiment(newNote.content); 
    setIsLoading(false);
  
    const newEntry = {
      title: newNote.title,
      content: newNote.content,
      sentiment: sentiment, // Store sentiment result
      date: new Date().toLocaleDateString("en-US", { 
        day: "numeric", 
        month: "short", 
        year: "numeric" 
      }),
      timestamp: new Date().getTime(), // Add timestamp for sorting
    };
  
    const updatedNotes = [newEntry, ...notes];
    setNotes(updatedNotes);
    setNewNote({ title: "", content: "" });
    setIsAdding(false);
    setSelectedNote(newEntry);
  
    // Save to session storage
    sessionStorage.setItem("logs", JSON.stringify(updatedNotes));
  
    // Add activity for streak calculation
    const today = new Date().toDateString();
    localStorage.setItem("hadActivityOn_" + today, "true");
  };
  

  // Delete a note
  const handleDeleteNote = (noteToDelete) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const updatedNotes = notes.filter(note => note !== noteToDelete);
      setNotes(updatedNotes);
      
      if (selectedNote === noteToDelete) {
        setSelectedNote(null);
      }
    }
  };

  // Filter notes based on sentiment
  const getFilteredNotes = () => {
    switch (filterType) {
      case "positive":
        return notes.filter(note => note.sentiment === 1);
      case "negative":
        return notes.filter(note => note.sentiment === 0);
      case "neutral":
        return notes.filter(note => note.sentiment === 0.5);
      default:
        return notes;
    }
  };
  

  // Get sentiment label text
  const getSentimentLabel = (sentiment) => {
    if (sentiment === 1) return "Positive";
    if (sentiment === 0) return "Negative";
    return "Neutral";
  };

  // Get sentiment emoji
  const getSentimentEmoji = (sentiment) => {
    if (sentiment === 1) return "😊";  // Positive
    if (sentiment === 0) return "😔";  // Negative
    return "😐";  // Neutral
  };
  

  return (
    <div className="journal-page">
      <Navbar />
      <div className="journal-container">
        <motion.div 
          className="sidebar"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <button className="add-note-btn" onClick={handleAddNewNote}>
            ✏️ New Journal Entry
          </button>
          
          <div className="filter-controls">
            <p>Filter by mood:</p>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn positive ${filterType === 'positive' ? 'active' : ''}`}
                onClick={() => setFilterType('positive')}
              >
                Positive 😊
              </button>
              <button 
                className={`filter-btn negative ${filterType === 'negative' ? 'active' : ''}`}
                onClick={() => setFilterType('negative')}
              >
                Negative 😔
              </button>
            </div>
          </div>
          
          <div className="notes-list-container">
            {getFilteredNotes().length === 0 ? (
              <p className="empty-notes">
                {filterType === 'all' 
                  ? "No journal entries yet. Create your first entry!" 
                  : `No ${filterType} entries found.`}
              </p>
            ) : (
              <ul className="note-list">
                {getFilteredNotes().map((note, index) => (
                  <motion.li
                    key={index}
                    className={`note-item ${selectedNote === note ? "active" : ""}`}
                    onClick={() => setSelectedNote(note)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="note-header">
                      <h3>{note.title}</h3>
                      <div className={`sentiment-indicator ${
                        note.sentiment === 1 ? 'positive' : 
                        note.sentiment === 0 ? 'negative' : 'neutral'
                      }`}>
                        {getSentimentEmoji(note.sentiment)}
                      </div>
                    </div>
                    <p className="note-date">{note.date}</p>
                    <p className="note-content">
                      {note.content.length > 60 
                        ? note.content.substring(0, 60) + "..." 
                        : note.content}
                    </p>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="note-content-area"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {isAdding ? (
            <div className="new-note-form">
              <h2>New Journal Entry</h2>
              {apiError && (
                <div className="api-error-message">
                  <p>{apiError}</p>
                </div>
              )}
              <input
                type="text"
                name="title"
                placeholder="Give your entry a title..."
                value={newNote.title}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="content"
                placeholder="Write your thoughts here... How are you feeling today?"
                value={newNote.content}
                onChange={handleInputChange}
                required
              />
              <div className="form-actions">
                <button 
                  className="cancel-btn" 
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </button>
                <button 
                  className="submit-btn" 
                  onClick={handleSubmit}
                  disabled={isLoading || !newNote.title.trim() || !newNote.content.trim()}
                >
                  {isLoading ? "Analyzing..." : "Save Entry"}
                </button>
              </div>
            </div>
          ) : selectedNote ? (
            <div className="view-note">
              <div className="note-header-view">
                <h2>{selectedNote.title}</h2>
                <button 
                  className="delete-note-btn" 
                  onClick={() => handleDeleteNote(selectedNote)}
                  title="Delete entry"
                >
                  🗑️
                </button>
              </div>
              <div className="note-meta">
                <p className="note-date-view">{selectedNote.date}</p>
                <div className="sentiment-display">
                  Mood: {getSentimentEmoji(selectedNote.sentiment)} {getSentimentLabel(selectedNote.sentiment)}
                </div>
              </div>
              <div className="note-content-view">
                {selectedNote.content.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
  <div className="empty-image-container">
    <div className="empty-image">
      📝
    </div>
  </div>
  <h2 className="empty-state-title">Your Journal</h2>
  <p className="empty-state-description">
    Select an entry to view or create a new one
  </p>
  <button className="create-entry-btn" onClick={handleAddNewNote}>
    Create New Entry
  </button>
</div>

          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Log;

