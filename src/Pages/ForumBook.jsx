import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import HTMLFlipBook from "react-pageflip";
import Navbar from "../Navbar/Navbar";

const ForumBook = () => {
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const bookRef = useRef(null);

  // Fetch domains on component mount
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://127.0.0.1:8000/domains")
      .then((response) => setDomains(response.data.domains || []))
      .catch((error) => {
        console.error("Error fetching domains:", error);
        setError("Failed to load domains. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch questions when domain changes
  useEffect(() => {
    if (selectedDomain) {
      setQuestions([]);
      setAnswers({});
      setLoading(true);
      fetchQuestions(selectedDomain, 1);
    }
  }, [selectedDomain]);

  const fetchQuestions = (domain, pageNumber) => {
    axios
      .get(`http://127.0.0.1:8000/questions/${domain}?page=${pageNumber}&per_page=5`)
      .then((response) => {
        const fetchedQuestions = response.data;
        setQuestions(fetchedQuestions);

        // Reset answers and fetch new ones
        setAnswers({});
        if (fetchedQuestions.length > 0) {
          Promise.all(
            fetchedQuestions.map((question) =>
              axios.get(`http://127.0.0.1:8000/answer/${question.id}`)
            )
          )
            .then((responses) => {
              const newAnswers = {};
              responses.forEach((res, index) => {
                let formattedAnswer = res.data.answer;

                // Simple formatting: add <br><br> after punctuation
                if (formattedAnswer && formattedAnswer.length > 150) {
                  formattedAnswer = formattedAnswer.replace(
                    /([.!?])\s+/g,
                    "$1<br><br>"
                  );
                  // Remove excessive line breaks
                  formattedAnswer = formattedAnswer.replace(
                    /<br><br><br>+/g,
                    "<br><br>"
                  );
                }

                newAnswers[fetchedQuestions[index].id] = formattedAnswer;
              });
              setAnswers(newAnswers);
            })
            .catch((error) => {
              console.error("Error fetching answers:", error);
              setError("Failed to load some answers. Please try again.");
            })
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
        setError("Failed to load questions. Please try again later.");
        setLoading(false);
      });
  };

  const handleDomainChange = (e) => {
    setSelectedDomain(e.target.value);
    setCurrentPage(0);
    if (bookRef.current) {
      bookRef.current.pageFlip().turnToPage(0);
    }
  };

  // Handle page turn events
  const handleFlip = (e) => {
    setCurrentPage(e.data);
  };

  return (
    <>
      <Navbar />

      {/* Custom CSS for the Forum Book */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lora:ital@0;1&family=Roboto+Slab&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .page {
          transition: transform 0.5s ease;
          background-color: #f8f5e6;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23dfd8ab' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
          position: relative;
          box-shadow: inset 3px 0px 20px rgba(0, 0, 0, 0.2);
          border-radius: 0 5px 5px 0;
        }

        .page:nth-child(odd) {
          box-shadow: inset -3px 0px 20px rgba(0, 0, 0, 0.2);
          border-radius: 5px 0 0 5px;
        }

        .page:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 2px;
          height: 100%;
          background: linear-gradient(to right, rgba(0,0,0,0.1), transparent 70%);
        }

        .page:nth-child(odd):before {
          left: auto;
          right: 0;
          background: linear-gradient(to left, rgba(0,0,0,0.1), transparent 70%);
        }

        .page-content {
          height: 100%;
          overflow: hidden;
          position: relative;
        }

        .page-content:after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-image: linear-gradient(rgba(255,255,255,0) 95%, rgba(0,0,0,0.08));
          pointer-events: none;
        }

        .paper-texture {
          background-color: #f8f5e6;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' ... %3C/svg%3E");
        }

        .ribbon {
          position: absolute;
          left: -5px;
          top: 15px;
          z-index: 1;
          overflow: hidden;
          width: 75px;
          height: 30px;
          text-align: right;
          transform: rotate(-45deg);
        }

        .ribbon span {
          font-size: 12px;
          font-weight: bold;
          color: #fff;
          text-align: center;
          line-height: 30px;
          background: #79A70A;
          width: 100%;
          display: block;
          box-shadow: 0 3px 10px -5px rgba(0, 0, 0, 1);
        }

        /* Book controls */
        .book-controls button {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .book-controls button:hover {
          background: rgba(255,255,255,0.25);
          transform: scale(1.1);
        }
        .book-controls button:active {
          transform: scale(0.95);
        }

        /* Loading spinner animation */
        @keyframes pageFlip {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(-180deg); }
        }
      `}</style>

      <div
        className="forum-book-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 80px)",
          padding: "20px",
          background: "linear-gradient(135deg, #5f4b8b, #372549)",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          position: "relative",
          fontFamily: "'Lora', serif",
          marginTop: "80px",
          overflow: "hidden",
        }}
      >
        {/* Subtle wood pattern background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "url('https://www.transparenttextures.com/patterns/wood-pattern.png')",
            opacity: 0.05,
            pointerEvents: "none",
          }}
        ></div>

        <h1
          style={{
            color: "#fff",
            marginBottom: "30px",
            fontSize: "36px",
            textAlign: "center",
            textShadow: "2px 2px 4px rgba(0,0,0,0.4)",
            fontWeight: "700",
            fontFamily: "'Playfair Display', serif",
            letterSpacing: "2px",
          }}
        >
          <span
            style={{
              borderBottom: "3px solid #e7d7bd",
              paddingBottom: "8px",
              position: "relative",
              display: "inline-block",
            }}
          >
            Forum Book
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "-9px",
                transform: "translateX(-50%)",
                width: "30px",
                height: "15px",
                backgroundColor: "#e7d7bd",
                clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
              }}
            ></div>
          </span>
        </h1>

        {/* Domain selection dropdown */}
        <div
          className="domain-selector"
          style={{
            position: "fixed",
            top: "150px",
            left: "20px",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            background: "rgba(55, 37, 73, 0.8)",
            backdropFilter: "blur(10px)",
            padding: "15px",
            borderRadius: "12px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h3
            style={{
              color: "#e7d7bd",
              marginBottom: "15px",
              fontWeight: "500",
              fontSize: "18px",
              fontFamily: "'Playfair Display', serif",
              textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              letterSpacing: "1px",
            }}
          >
            <span role="img" aria-label="book">
              📚
            </span>{" "}
            Select Topic:
          </h3>
          <select
            value={selectedDomain}
            onChange={handleDomainChange}
            style={{
              padding: "12px 16px",
              fontSize: "16px",
              width: "220px",
              borderRadius: "8px",
              border: "1px solid #e7d7bd",
              outline: "none",
              background: "rgba(244, 241, 222, 0.95)",
              color: "#372549",
              fontWeight: "500",
              cursor: "pointer",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease",
              fontFamily: "'Lora', serif",
            }}
            className="domain-dropdown"
          >
            <option value="" disabled>
              Select a Domain
            </option>
            {domains.length > 0 ? (
              domains.map((domain, index) => (
                <option key={index} value={domain}>
                  {domain}
                </option>
              ))
            ) : (
              <option disabled>Loading...</option>
            )}
          </select>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div
            className="loading-spinner"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "300px",
              gap: "20px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "70px",
                height: "90px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "70px",
                  height: "90px",
                  background: "#e7d7bd",
                  borderRadius: "5px 10px 10px 5px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                  animation: "pageFlip 1.5s ease-in-out infinite alternate",
                  transformOrigin: "left center",
                }}
              >
                <div
                  style={{
                    width: "90%",
                    height: "4px",
                    background: "rgba(55, 37, 73, 0.2)",
                    marginBottom: "10px",
                    borderRadius: "2px",
                  }}
                ></div>
                <div
                  style={{
                    width: "70%",
                    height: "4px",
                    background: "rgba(55, 37, 73, 0.2)",
                    marginBottom: "10px",
                    borderRadius: "2px",
                  }}
                ></div>
                <div
                  style={{
                    width: "80%",
                    height: "4px",
                    background: "rgba(55, 37, 73, 0.2)",
                    borderRadius: "2px",
                  }}
                ></div>
              </div>
            </div>
            <p
              style={{
                color: "#e7d7bd",
                fontFamily: "'Playfair Display', serif",
                fontSize: "18px",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              Opening the book...
            </p>
          </div>
        )}

        {/* Error message display */}
        {error && (
          <div
            className="error-message"
            style={{
              background: "rgba(150,0,0,0.1)",
              color: "#fff",
              padding: "20px 25px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
              maxWidth: "600px",
              border: "1px solid rgba(255,0,0,0.2)",
              backdropFilter: "blur(5px)",
              boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
              animation: "fadeIn 0.5s ease",
            }}
          >
            <p style={{ fontFamily: "'Lora', serif", marginBottom: "15px" }}>
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                if (selectedDomain) fetchQuestions(selectedDomain, 1);
              }}
              style={{
                background: "linear-gradient(to right, #9c0000, #760000)",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                marginTop: "10px",
                cursor: "pointer",
                fontWeight: "500",
                fontFamily: "'Lora', serif",
                boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Book display */}
        {selectedDomain && questions.length > 0 && !loading && (
          <div
            className="book-container"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              padding: "20px",
              position: "relative",
            }}
          >
            {/* Book navigation controls */}
            <div
              className="book-controls"
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "550px",
                marginBottom: "15px",
                zIndex: 3,
              }}
            >
              <button
                onClick={() => bookRef.current.pageFlip().flipPrev()}
                disabled={currentPage === 0}
                style={{
                  opacity: currentPage === 0 ? 0.5 : 1,
                  cursor: currentPage === 0 ? "default" : "pointer",
                }}
              >
                <span role="img" aria-label="previous page">
                  ◀
                </span>
              </button>
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(5px)",
                  padding: "5px 15px",
                  borderRadius: "20px",
                  color: "#fff",
                  fontSize: "14px",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Page {currentPage + 1} of {questions.length + 2}
                {/* +2 to account for Cover + TOC + Back Cover */}
              </div>
              <button
                onClick={() => bookRef.current.pageFlip().flipNext()}
                disabled={currentPage === questions.length + 1}
                style={{
                  opacity: currentPage === questions.length + 1 ? 0.5 : 1,
                  cursor:
                    currentPage === questions.length + 1 ? "default" : "pointer",
                }}
              >
                <span role="img" aria-label="next page">
                  ▶
                </span>
              </button>
            </div>

            <div
              style={{
                position: "relative",
                transform: "perspective(1000px)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Book cover shadow */}
              <div
                style={{
                  position: "absolute",
                  left: "5%",
                  right: "5%",
                  bottom: "-15px",
                  height: "15px",
                  background: "rgba(0,0,0,0.4)",
                  borderRadius: "50%",
                  filter: "blur(10px)",
                  zIndex: 0,
                }}
              ></div>

              <HTMLFlipBook
                ref={bookRef}
                className="flipbook"
                width={550}
                height={700}
                size="stretch"
                minWidth={350}
                maxWidth={550}
                minHeight={500}
                maxHeight={700}
                drawShadow={true}
                flippingTime={10}
                usePortrait={false}
                startPage={0}
                showCover={true}
                autoSize={true}
                maxShadowOpacity={0.3}
                mobileScrollSupport={true}
                clickEventForward={true}
                useMouseEvents={true}
                style={{
                  boxShadow: "0px 25px 45px rgba(0, 0, 0, 0.6)",
                }}
                onFlip={handleFlip}
              >
                {/* ========== COVER PAGE ========== */}
                <div
                  className="page"
                  style={{
                    background: "linear-gradient(135deg, #4b3832, #372549)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "10px 0 0 10px",
                    boxShadow: "inset -5px 0 15px rgba(0,0,0,0.4)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background:
                        "url('https://www.transparenttextures.com/patterns/leather.png')",
                      opacity: 0.2,
                    }}
                  ></div>
                  <div className="ribbon">
                  </div>
                  <div
                    style={{
                      width: "80%",
                      height: "80%",
                      border: "5px double #e7d7bd",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "20px",
                      position: "relative",
                    }}
                  >
                    <h2
                      style={{
                        color: "#e7d7bd",
                        fontSize: "40px",
                        textAlign: "center",
                        fontFamily: "'Playfair Display', serif",
                        marginBottom: "20px",
                        letterSpacing: "3px",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                      }}
                    >
                      Knowledge Guide
                    </h2>
                    <h3
                      style={{
                        color: "#e7d7bd",
                        fontSize: "28px",
                        textAlign: "center",
                        fontFamily: "'Playfair Display', serif",
                        fontStyle: "italic",
                        fontWeight: "normal",
                      }}
                    >
                      {selectedDomain}
                    </h3>
                    <div
                      style={{
                        width: "80px",
                        height: "2px",
                        background: "#e7d7bd",
                        margin: "30px auto",
                      }}
                    ></div>
                    <p
                      style={{
                        color: "#e7d7bd",
                        fontFamily: "'Lora', serif",
                        textAlign: "center",
                        fontSize: "14px",
                        fontStyle: "italic",
                        opacity: 0.8,
                      }}
                    >
                      Explore insightful discussions and expert answers
                    </p>
                    <div
                      style={{
                        position: "absolute",
                        bottom: "30px",
                        fontSize: "12px",
                        color: "#e7d7bd",
                        opacity: 0.5,
                        fontFamily: "'Lora', serif",
                      }}
                    >
                      Forum Edition
                    </div>
                  </div>
                </div>

                {/* ========== TABLE OF CONTENTS ========== */}
                <div className="page paper-texture">
                  <div
                    className="page-content"
                    style={{
                      padding: "50px 40px",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      justifyContent: "flex-start",
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "28px",
                        marginBottom: "20px",
                      }}
                    >
                      Table of Contents
                    </h2>
                    <ol
                      style={{
                        marginLeft: "20px",
                        fontFamily: "'Lora', serif",
                        fontSize: "16px",
                        lineHeight: "1.8",
                      }}
                    >
                      {questions.map((q, i) => (
                        <li key={q.id}>{q.title}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* ========== DYNAMIC PAGES FOR EACH QUESTION ========== */}
                {questions.map((question, index) => (
                  <div className="page paper-texture" key={question.id}>
                    <div
                      className="page-content"
                      style={{
                        padding: "50px 40px",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "flex-start",
                        overflow: "hidden", // outer container remains fixed
                      }}
                    >
                      {/* Inner scrollable container */}
                      <div
                        style={{
                          height: "100%",
                          overflowY: "auto",
                          paddingRight: "10px", // allow space for scrollbar
                        }}
                      >
                        <h3
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "24px",
                            marginBottom: "10px",
                          }}
                        >
                          {question.title}
                        </h3>
                        <p
                          style={{
                            fontFamily: "'Lora', serif",
                            fontSize: "16px",
                            marginBottom: "20px",
                            lineHeight: "1.6",
                          }}
                        >
                          <strong>Question:</strong> {question.body}
                        </p>
                        <div
                          className="answer-text"
                          style={{
                            fontFamily: "'Lora', serif",
                            fontSize: "16px",
                            lineHeight: "1.6",
                            color: "#333",
                          }}
                          dangerouslySetInnerHTML={{
                            __html:
                              answers[question.id] ||
                              "<em>No answer available.</em>",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* ========== BACK COVER PAGE ========== */}
                <div
                  className="page"
                  style={{
                    background: "linear-gradient(135deg, #4b3832, #372549)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "0 10px 10px 0",
                    boxShadow: "inset 5px 0 15px rgba(0,0,0,0.4)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background:
                        "url('https://www.transparenttextures.com/patterns/leather.png')",
                      opacity: 0.2,
                    }}
                  ></div>
                  <div
                    style={{
                      width: "80%",
                      height: "80%",
                      border: "5px double #e7d7bd",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "20px",
                      position: "relative",
                    }}
                  >
                    <h2
                      style={{
                        color: "#e7d7bd",
                        fontSize: "30px",
                        textAlign: "center",
                        fontFamily: "'Playfair Display', serif",
                        marginBottom: "20px",
                        letterSpacing: "2px",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                      }}
                    >
                      The End
                    </h2>
                    <p
                      style={{
                        color: "#e7d7bd",
                        fontFamily: "'Lora', serif",
                        textAlign: "center",
                        fontSize: "16px",
                        opacity: 0.8,
                        lineHeight: "1.5",
                      }}
                    >
                      Thank you for reading!
                    </p>
                  </div>
                </div>
              </HTMLFlipBook>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ForumBook;
