import React, { useState, useRef, useEffect } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { X, MessageCircle, Send, Loader2 } from "lucide-react";
import "../styles/Chatbot.css";

// Constants
const USER_ID = 27; // TODO: Replace with logic from your Auth Context
const API_URL = "http://localhost:3000"; // Ensure this matches your backend

interface Message {
  sender: "user" | "bot";
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]); // Start empty, will load history
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasFetchedHistory, setHasFetchedHistory] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 1. Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // 2. Fetch History when opened (only once per session)
  useEffect(() => {
    if (isOpen && !hasFetchedHistory) {
      const fetchHistory = async () => {
        try {
          const res = await fetch(`${API_URL}/chathistory/history/${USER_ID}`);
          if (!res.ok) throw new Error("Failed to load history");
          
          const data = await res.json();
          
          // Transform DB format to UI format
          const historyMessages: Message[] = [];
          data.forEach((row: any) => {
             historyMessages.push({ sender: "user", text: row.question });
             historyMessages.push({ sender: "bot", text: row.answer });
          });

          // If no history, add default greeting
          if (historyMessages.length === 0) {
            historyMessages.push({ sender: "bot", text: "Hello! Ask me anything about food, health, or fitness." });
          }

          setMessages(historyMessages);
          setHasFetchedHistory(true);
        } catch (err) {
          console.error("History fetch error:", err);
          // Fallback greeting if error
          setMessages([{ sender: "bot", text: "Hello! (Could not load history)" }]);
        }
      };

      fetchHistory();
    }
  }, [isOpen, hasFetchedHistory]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userQuestion = input;
    setInput(""); 

    // Add User Message Optimistically
    setMessages((prev) => [...prev, { sender: "user", text: userQuestion }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: USER_ID, 
          question: userQuestion,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Sorry, I couldn't reach the server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="chatbot-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="chatbot-overlay" onClick={handleOverlayClick}>
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="chatbot-modal"
            >
              <div className="chatbot-header">
                <h2>Health Assistant</h2>
                <button onClick={() => setIsOpen(false)} className="close-btn">
                  <X size={18} />
                </button>
              </div>

              <div className="chatbot-messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.sender === "user" ? "user" : "bot"}`}
                  >
                    {msg.sender === "bot" ? (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="message bot loading">
                    <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className="chatbot-input">
                <input
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about food..."
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  className="send-btn"
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;