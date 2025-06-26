// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import qaData from './qaData';

function OptionBoxes({ options, onSelect }) {
  return (
    <div className="option-box-container">
      {options.map((opt) => (
        <div
          key={opt}
          className="option-box"
          onClick={() => onSelect(opt)}
        >
          {opt}
        </div>
      ))}
    </div>
  );
}



function App() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hi, I'm Micah, DDT's virtual assistant, how can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcomeOptions, setShowWelcomeOptions] = useState(true);
  const [currentFollowUps, setCurrentFollowUps] = useState(null);
  const [collectedInfo, setCollectedInfo] = useState({});
  const [isTyping, setIsTyping] = useState(false);

  const clean = (str) =>
    str
      .toLowerCase()
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();

  // fuzzy match logic unchanged
  const findBestMatch = (text) => {
    // ... existing fuzzy match code ...
  };

  const addMessage = (msg) => {
    const withTime = {
      ...msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, withTime]);
  };

  const handleSend = async (text = input) => {
    const userRaw = text.trim();
    if (!userRaw) return;
    setInput('');
    setShowWelcomeOptions(false);

    // echo user message
    addMessage({ sender: 'user', text: userRaw });

    // follow-up & rule-based logic here...
    // if fall-through to GPT then:
    setIsTyping(true);
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
', },
  body: JSON.stringify({ /* … */ }),
});
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are Micah, a friendly property-management expert helping U.S. Navy sailors. Below is the list of frequently asked questions and answers, which you should use as primary reference. Only if none match should you provide freeform guidance. FAQs: ${JSON.stringify(qaData)}`
            },
            { role: 'user', content: userRaw }
          ]
        }),
      });
      const js = await res.json();
      const reply = js.choices?.[0]?.message?.content || 'Sorry, something went wrong.';
      setIsTyping(false);
      addMessage({ sender: 'bot', text: reply });
    } catch (err) {
      setIsTyping(false);
      addMessage({ sender: 'bot', text: 'Error contacting GPT. Check your API key.' });
    }
  };

  return (
    <>
      <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>💬</button>
      {isOpen && (
        <div className="chat-wrapper">
          <div className="chat-box">
            <div className="chat-header">Virtual Assistant!</div>
            <div className="chat-body">
              {messages.map((m, i) => (
                <div key={i} className={`message-row ${m.sender}-row`}>
                  {m.sender === 'bot' && (
                    <img src="https://i.postimg.cc/wT5gNFQ9/2.jpg" alt="bot-avatar" className="avatar" />
                  )}
                  <div className={`message ${m.sender}-msg`}>
                    <span className="message-text">{m.text}</span>
                    <span className="timestamp">{m.timestamp}</span>
                  </div>
                </div>
              ))}
              {isTyping && <div className="typing-indicator">Micah is typing...</div>}
              {showWelcomeOptions && (
                <div className="welcome-options">
                  {['Rent','Payment','Application','Tour','Emergency contact','Other'].map(opt => (
                    <button key={opt} className="welcome-btn" onClick={() => handleSend(opt)}>{opt}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="chat-footer">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button onClick={() => handleSend()}>➤</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
