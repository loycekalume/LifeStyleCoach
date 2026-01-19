// components/Chatbot.tsx
import React, { useState, useRef, useEffect } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { X, MessageCircle, Send, Loader2 } from "lucide-react";
import  api  from "../utils/axiosInstance"; // ✅ Import our axios instance
import "../styles/Chatbot.css";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasFetchedHistory, setHasFetchedHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
          // No user_id needed - backend reads from cookie
          const res = await api.get('/chathistory/history');
          
          // Transform DB format to UI format
          const historyMessages: Message[] = [];
          res.data.forEach((row: any) => {
            historyMessages.push({ sender: "user", text: row.question });
            historyMessages.push({ sender: "bot", text: row.answer });
          });

          // If no history, add default greeting
          if (historyMessages.length === 0) {
            historyMessages.push({ 
              sender: "bot", 
              text: "Hello! Ask me anything about food, health, or fitness." 
            });
          }

          setMessages(historyMessages);
          setHasFetchedHistory(true);
          setError(null);
        } catch (err: any) {
          console.error("History fetch error:", err);
          
          if (err.response?.status === 401) {
            setError("Session expired. Please log in again.");
            setMessages([{ 
              sender: "bot", 
              text: "⚠️ Please log in to continue chatting." 
            }]);
          } else {
            // Fallback greeting if error
            setMessages([{ 
              sender: "bot", 
              text: "Hello! (Could not load history)" 
            }]);
          }
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
    setError(null);

    try {
      // ✅ No user_id needed - backend reads from cookie
      const response = await api.post('/chat', {
        question: userQuestion,
      });

      setMessages((prev) => [...prev, { 
        sender: "bot", 
        text: response.data.reply 
      }]);

    } catch (error: any) {
      console.error("Chat Error:", error);
      
      if (error.response?.status === 401) {
        setError("Session expired");
        setMessages((prev) => [...prev, { 
          sender: "bot", 
          text: "⚠️ Your session expired. Please log in again." 
        }]);
      } else {
        setMessages((prev) => [...prev, { 
          sender: "bot", 
          text: "⚠️ Sorry, I couldn't reach the server." 
        }]);
      }
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

              {error && (
                <div className="chatbot-error">
                  ⚠️ {error}
                </div>
              )}

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
                    <span className="dot">.</span>
                    <span className="dot">.</span>
                    <span className="dot">.</span>
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
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Send size={16} />
                  )}
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