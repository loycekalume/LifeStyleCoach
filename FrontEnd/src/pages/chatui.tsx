import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import axiosInstance from "../utils/axiosInstance"; 
import "../styles/chatui.css";

// Connect to the backend URL (ensure this matches your server port)
const SOCKET_URL = "http://localhost:3000"; 

interface Message {
  sender: "you" | "other";
  content: string;
  time: string;
}

const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState<Message[]>([]);
  
  // Ref to auto-scroll to bottom
  const bottomRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Socket Connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Join the specific room (conversation)
    if (conversationId) {
      newSocket.emit("join_room", conversationId);
    }

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [conversationId]);

  // 2. Listen for Incoming Messages
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (data: any) => {
      // Add incoming message to list
      const newMessage: Message = {
        sender: "other",
        content: data.message,
        time: data.time
      };
      setMessageList((list) => [...list, newMessage]);
    });

    // Remove listener to prevent duplicates
    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  // 3. Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  // 4. Send Message Function
  const sendMessage = async () => {
    if (currentMessage.trim() === "" || !socket || !conversationId) return;

    const messageData = {
      room: conversationId,
      message: currentMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // A. Emit to Socket Server (Real-time)
    socket.emit("send_message", messageData);

    // B. Update UI immediately
    setMessageList((list) => [
      ...list, 
      { sender: "you", content: currentMessage, time: messageData.time }
    ]);
    
    // C. Clear Input
    setCurrentMessage("");

    // D. Optional: Persist to Database via API
    await axiosInstance.post('/messages/start', { 
       conversation_id: conversationId, 
       content: currentMessage 
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Live Chat</h2>
      </div>

      <div className="chat-body">
        {messageList.map((msg, index) => (
          <div
            key={index}
            className={`message-container ${msg.sender}`}
          >
            <div className="bubble">
              <p>{msg.content}</p>
            </div>
            <span className="meta">{msg.time}</span>
          </div>
        ))}
        {/* Invisible div to scroll to */}
        <div ref={bottomRef} />
      </div>

      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Type a message..."
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyPress={(event) => event.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="send-btn">
          Send ➜
        </button>
      </div>
    </div>
  );
};

export default ChatPage;