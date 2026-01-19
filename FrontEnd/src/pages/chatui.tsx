// src/pages/MessagesPage.tsx (Replace your ChatPage.tsx)
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import axiosInstance from "../utils/axiosInstance"; 
import "../styles/chatui.css";

const SOCKET_URL = "http://localhost:3000"; 

interface Conversation {
  conversation_id: number;
  other_person_name: string;
  other_person_id: number;
  other_person_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Message {
  sender_id: number;
  content: string;
  time?: string;
}

const MessagesPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState<Message[]>([]);
  
  // NEW: Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<number | null>(
    conversationId ? parseInt(conversationId) : null
  );
  const [loading, setLoading] = useState(true);
  
  const myUserId = Number(localStorage.getItem("userId")); 
  const userRole = localStorage.getItem("userRole");
  const bottomRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Conversations on Mount
  useEffect(() => {
    fetchConversations();
    
    // Connect Socket
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    
    return () => { newSocket.disconnect(); };
  }, []);

  // 2. Load Messages When Active Conversation Changes
  useEffect(() => {
    if (activeConversation) {
      fetchHistory(activeConversation);
      socket?.emit("join_room", activeConversation);
      markAsRead(activeConversation);
      
      // Update URL
      navigate(`/messages/${activeConversation}`, { replace: true });
    }
  }, [activeConversation]);

  // 3. Listen for Real-time Messages
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (data: any) => {
      const newMessage: Message = {
        sender_id: data.senderId,
        content: data.message,
        time: data.time
      };
      
      setMessageList((list) => [...list, newMessage]);
      
      // Update last message in sidebar
      setConversations(prev => prev.map(conv => 
        conv.conversation_id === activeConversation
          ? { ...conv, last_message: data.message, last_message_time: new Date().toLocaleTimeString() }
          : conv
      ));
    });

    return () => { socket.off("receive_message"); };
  }, [socket, activeConversation]);

  // 4. Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  // Fetch all conversations
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/messages/conversations");
      setConversations(response.data);
      
      // If no active conversation but there are conversations, select the first one
      if (!activeConversation && response.data.length > 0) {
        setActiveConversation(response.data[0].conversation_id);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch message history
  const fetchHistory = async (convId: number) => {
    try {
      const res = await axiosInstance.get(`/messages/${convId}/messages`);
      const history = res.data.map((msg: any) => ({
        sender_id: msg.sender_id,
        content: msg.content,
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setMessageList(history);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  // Mark messages as read
  const markAsRead = async (convId: number) => {
    try {
      await axiosInstance.put(`/messages/${convId}/read`);
      setConversations(prev => prev.map(conv =>
        conv.conversation_id === convId ? { ...conv, unread_count: 0 } : conv
      ));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Send Message
  const sendMessage = async () => {
    if (currentMessage.trim() === "" || !socket || !activeConversation) return;

    const messageData = {
      room: activeConversation,
      message: currentMessage,
      senderId: myUserId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socket.emit("send_message", messageData);

    setMessageList((list) => [...list, { 
      sender_id: myUserId, 
      content: currentMessage, 
      time: messageData.time 
    }]);
    
    // Update last message in sidebar
    setConversations(prev => prev.map(conv =>
      conv.conversation_id === activeConversation
        ? { ...conv, last_message: currentMessage, last_message_time: messageData.time }
        : conv
    ));
    
    setCurrentMessage("");
  };

  const handleBackToDashboard = () => {
    if (userRole === "Client") navigate("/client");
    else if (userRole === "Instructor") navigate("/instructor");
    else if (userRole === "Dietician") navigate("/dietician");
    else navigate("/");
  };

  const activeConv = conversations.find(c => c.conversation_id === activeConversation);

  return (
    <div className="messages-page-container">
      {/* Sidebar - Conversations List */}
      <div className="conversations-sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <button onClick={handleBackToDashboard} className="back-button">
            ← Back to Dashboard
          </button>
          <h1 className="sidebar-title">Messages</h1>
          <p className="sidebar-subtitle">{conversations.length} conversations</p>
        </div>

        {/* Conversations List */}
        <div className="conversations-list">
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <p>No conversations yet</p>
              <small>Start chatting with instructors or clients!</small>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.conversation_id}
                onClick={() => setActiveConversation(conv.conversation_id)}
                className={`conversation-item ${
                  activeConversation === conv.conversation_id ? 'active' : ''
                }`}
              >
                <div className="conversation-avatar">
                  {conv.other_person_name.charAt(0)}
                </div>
                <div className="conversation-details">
                  <div className="conversation-header">
                    <h3 className="conversation-name">{conv.other_person_name}</h3>
                    <span className="conversation-time">{conv.last_message_time}</span>
                  </div>
                  <div className="conversation-preview">
                    <p className="last-message">{conv.last_message || "No messages yet"}</p>
                    {conv.unread_count > 0 && (
                      <span className="unread-badge">{conv.unread_count}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-area">
        {activeConversation ? (
          <>
            {/* Chat Header */}
           {/* Chat Header */}
<div className="chat-header">
  <div className="chat-header-avatar">
    {(activeConv?.other_person_name || "?").charAt(0).toUpperCase()}
  </div>
  <div className="chat-header-info">
    <h2>{activeConv?.other_person_name || "Unknown User"}</h2>
    <p className="status-online">Active now</p>
  </div>
</div>

            {/* Messages Area */}
            <div className="chat-body">
              {messageList.map((msg, index) => {
                const isMe = msg.sender_id === myUserId;
                return (
                  <div key={index} className={`message-container ${isMe ? "you" : "other"}`}>
                    {!isMe && (
                      <div className="sender-name">{activeConv?.other_person_name}</div>
                    )}
                    <div className="bubble">
                      <p>{msg.content}</p>
                    </div>
                    <span className="meta">{msg.time}</span>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="chat-footer">
              <input
                type="text"
                value={currentMessage}
                placeholder="Type a message..."
                onChange={(event) => setCurrentMessage(event.target.value)}
                onKeyPress={(event) => event.key === "Enter" && sendMessage()}
              />
              <button 
                onClick={sendMessage} 
                className="send-btn"
                disabled={!currentMessage.trim()}
              >
                Send ➜
              </button>
            </div>
          </>
        ) : (
          <div className="chat-empty-state">
            <div className="empty-icon">💬</div>
            <p className="empty-title">Select a conversation</p>
            <p className="empty-subtitle">Choose a chat from the sidebar to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;