import React, { useState } from "react";
import { Button, Box, Typography, Grid, TextField, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";


// Define your questions array.
const questions = [
  { question: "What is your Gender?", type: "options", options: ["Male", "Female"] },
  { question: "What is your Age?", type: "numeric" },
  { question: "Academic pressure (1-5)?", type: "options", options: ["1", "2", "3", "4", "5"] },
  { question: "Study satisfaction (1-5)?", type: "options", options: ["1", "2", "3", "4", "5"] },
  { question: "Sleep duration?", type: "options", options: ["<5hr", "5-6hr", ">8hr", "<8hr"] },
  { question: "Dietary habits?", type: "options", options: ["Moderate", "Healthy", "Unhealthy"] },
  { question: "Suicidal thoughts?", type: "options", options: ["Yes", "No"] },
  { question: "Study hours?", type: "numeric" },
  { question: "Financial stress (1-5)?", type: "options", options: ["1", "2", "3", "4", "5"] },
  { question: "Family history of mental illness?", type: "options", options: ["Yes", "No"] },
];

// Define the mapping for specific options.
const optionMappings = {
  "Male": 1, "Female": 0,
  "Moderate": 1, "Healthy": 0, "Unhealthy": 2,
  "Yes": 1, "No": 0,
  "<5hr": 2, "5-6hr": 0, ">8hr": 3, "<8hr": 1,
};

const QuizPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [quizFinished, setQuizFinished] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  // Emotion-based messages
  const messages = {
    "Not Depressed": {
      text: "You're doing amazing! Keep up the positive vibes. 🌟✨",
      color: "#00ff99",
    },
    "Depressed": {
      text: "You're not alone. Stay strong and take it one step at a time. 💙🌿",
      color: "#ff3366",
    },
  };

  // Ensure that answers are properly stored
  const handleAnswerClick = (answer) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      if (questions[currentQuestion].type === "options") {
        newAnswers[currentQuestion] = optionMappings[answer] ?? 0;
      } else {
        const parsedAnswer = parseInt(answer, 10);
        newAnswers[currentQuestion] = isNaN(parsedAnswer) ? 0 : parsedAnswer;
      }
      return newAnswers;
    });
  };

  // Prevents skipping unanswered questions
  const handleNextQuestion = () => {
    if (answers[currentQuestion] === null) {
      alert("Please select an answer before proceeding.");
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      submitAnswers();
    }
  };

  // Submit the answers array to FastAPI backend
  const submitAnswers = async () => {
    const sanitizedAnswers = answers.map((answer) => (answer == null ? 0 : answer));

    console.log("Final Answers Sent to Backend:", sanitizedAnswers); // Debugging

    try {
      setError(null);
      const response = await axios.post("http://127.0.0.1:8000/predict", { features: sanitizedAnswers });
      setPrediction(response.data.prediction);
    } catch (err) {
      console.error("Error fetching prediction:", err);
      setError("Failed to get a response. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        padding: "20px",
        textAlign: "center",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // background: "linear-gradient(135deg, #a8c0ff 10%, #3f2b96 100%)", // Calm gradient
      }}
    >
      {!quizFinished ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(12px)",
            padding: "30px",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(255, 255, 255, 0.2)",
          }}
        >
          <Typography variant="h4" sx={{ color: "#000", marginBottom: "20px", fontWeight: "bold" }}>
            {questions[currentQuestion].question}
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {questions[currentQuestion].type === "options" ? (
              questions[currentQuestion].options.map((option, index) => (
                <Grid item key={index}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleAnswerClick(option)}
                      sx={{
                        padding: "12px 24px",
                        margin: "10px",
                        fontSize: "16px",
                        color: "#fff",
                        border: "2px solid #00e5ff",
                        backgroundColor: answers[currentQuestion] == optionMappings[option] ? "#00e5ff" : "transparent",
                        boxShadow: "0 0 10px #00e5ff",
                        "&:hover": { backgroundColor: "#00e5ff", color: "#000" },
                      }}
                    >
                      {option}
                    </Button>
                  </motion.div>
                </Grid>
              ))
            ) : (
              <TextField
                type="number"
                variant="outlined"
                value={answers[currentQuestion] ?? ""}
                onChange={(e) => handleAnswerClick(e.target.value)}
                sx={{ width: "220px", marginTop: "20px", color: "#fff", backgroundColor: "#333" }}
                InputProps={{ style: { color: "#fff" } }}
              />
            )}
          </Grid>
          <Box sx={{ marginTop: "30px" }}>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                onClick={handleNextQuestion}
                sx={{
                  padding: "12px 24px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#fff",
                  background: "#00e5ff",
                  borderRadius: "10px",
                  "&:hover": { backgroundColor: "#00bcd4" },
                }}
              >
                {currentQuestion < questions.length - 1 ? "Next" : "Finish"}
              </Button>
            </motion.div>
          </Box>
        </motion.div>
      ) : (
        <Card sx={{ minWidth: 275, padding: "20px", boxShadow: `0 0 20px ${messages[prediction]?.color || "#fff"}` }}>
          <CardContent>
            <Typography variant="h3" sx={{ color: messages[prediction]?.color || "#fff", fontWeight: "bold" }}>
              {messages[prediction]?.text || "Processing..."}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default QuizPage;
