import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Link } from 'react-router-dom';
import Model from '../Components/TropicalPlants';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello, I’m here to help. Take a deep breath, how are you feeling today?' },
  ]);
  const [input, setInput] = useState('');
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleSendMessage = async () => {
    if (input.trim()) {
      // 1. Add the user's message to the chat
      setMessages((prev) => [...prev, { sender: 'user', text: input }]);
      
      try {
        // 2. Make a POST request to the FastAPI backend
        const response = await fetch('http://localhost:8000/api/chatbot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: input }),
        });

        if (!response.ok) {
          throw new Error(`Error! status: ${response.status}`);
        }

        const data = await response.json();
        // 3. Append the bot’s response to messages
        setMessages((prev) => [...prev, { sender: 'bot', text: data.response }]);
      } catch (error) {
        console.error('Error sending message:', error);
        // Optional: show an error message in the chat
        setMessages((prev) => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble responding right now." }]);
      }

      // Clear the input
      setInput('');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100vh',
        maxWidth: '450px',
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '20px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        padding: '20px',
        backdropFilter: 'blur(15px)',
        animation: fadeIn ? 'fadeIn 1s ease-in-out' : '',
        transition: 'all 0.4s ease-in-out',
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .chat-hover:hover {
            transform: scale(1.03);
            transition: transform 0.2s ease-in-out;
          }

          .btn-hover:hover {
            background: #8ecae6 !important;
            transform: scale(1.05);
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease-in-out;
          }
        `}
      </style>

      <div
        style={{
          padding: '15px',
          background: 'linear-gradient(45deg, #A8DADC, #F1FAEE)',
          fontWeight: 'bold',
          fontSize: '18px',
          textAlign: 'center',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
        }}
      >
        🌸 Connect with a Psychiatrist
      </div>
      <div
        style={{
          flex: 1,
          padding: '15px',
          overflowY: 'auto',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          animation: fadeIn ? 'fadeIn 0.8s ease-in-out' : '',
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className="chat-hover"
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              background: msg.sender === 'user' ? 'rgba(168, 218, 220, 0.8)' : 'rgba(241, 250, 238, 0.8)',
              padding: '12px 18px',
              borderRadius: '20px',
              maxWidth: '75%',
              fontSize: '15px',
              marginBottom: '10px',
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="chat-hover"
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '15px',
            border: '1px solid #ddd',
            borderRadius: '25px',
            marginRight: '15px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            color: '#333',
            outline: 'none',
            transition: 'all 0.3s ease-in-out',
          }}
        />
        <button
          onClick={handleSendMessage}
          className="btn-hover"
          style={{
            padding: '12px 18px',
            background: '#A8DADC',
            color: '#fff',
            border: 'none',
            borderRadius: '25px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

const RotatingModel = () => {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.002;
    }
  });
  return (
    <group ref={ref}>
      <Model scale={0.4} position={[1.5, -0.8, 0]} />
    </group>
  );
};

const Scene = () => {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
      }}
    >
      <div style={{ flex: 1 }}>
        <Canvas camera={{ position: [5, 2, 5], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 10]} intensity={0.7} />
          <RotatingModel />
          <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} />
        </Canvas>
      </div>

      <div
        style={{
          flex: 0.4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(to right, rgba(199, 198, 198, 0.5), rgba(203, 189, 199, 0.6))',
          backdropFilter: 'blur(10px)',
          height: '100vh',
        }}
      >
        <Chatbot />
      </div>
    </div>
  );
};

export default Scene;
