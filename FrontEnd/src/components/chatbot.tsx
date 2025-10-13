import React, { useState, useRef } from "react";
import type{ ChangeEvent } from "react";
import type{ MouseEvent } from "react";
import { motion } from "framer-motion";
import { X, MessageCircle, Send } from "lucide-react";
import "../styles/Chatbot.css";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState<string>("");

  const modalRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate AI reply (replace with backend call later)
    setTimeout(() => {
      const botReply: Message = {
        sender: "bot",
        text: "Got it! (AI response placeholder)",
      };
      setMessages((prev) => [...prev, botReply]);
    }, 800);
  };

  // ✅ Close chatbot when user clicks outside modal
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="chatbot-button"
        whileHover={{ scale: 1.1 }}
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Modal */}
      {isOpen && (
        <div className="chatbot-overlay" onClick={handleOverlayClick}>
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="chatbot-modal"
          >
            <div className="chatbot-header">
              <h2>Chat with AI</h2>
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
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="chatbot-input">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Type a message..."
              />
              <button onClick={handleSend} className="send-btn">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
