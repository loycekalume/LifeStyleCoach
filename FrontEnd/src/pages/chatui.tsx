import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import axiosInstance from "../utils/axiosInstance"; 
import "../styles/chatui.css";

// ✅ FIX: Use Environment Variable or Fallback
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"; 

// --- 🕒 HELPER: WhatsApp-style Date Formatting ---
const formatDateForSidebar = (isoDateString?: string) => {
  if (!isoDateString) return "";
  
  const date = new Date(isoDateString);
  const now = new Date();
  
  // Check if valid date
  if (isNaN(date.getTime())) return "";

  const isToday = date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() &&
                      date.getMonth() === yesterday.getMonth() &&
                      date.getFullYear() === yesterday.getFullYear();

  // 1. If Today -> Show Time (10:30 AM)
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // 2. If Yesterday -> Show "Yesterday"
  if (isYesterday) {
    return "Yesterday";
  }

  // 3. If within last 7 days -> Show Day Name (Monday, Tuesday...)
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'long' });
  }

  // 4. Older -> Show Date (22/01/2026)
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// --- Interfaces ---
interface Conversation {
  conversation_id: number;
  other_person_name: string;
  other_person_id: number;
  other_person_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  other_person_role?: string; 
}

interface Message {
  sender_id: number;
  content: string;
  time: string;
}

const MessagesPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState<Message[]>([]);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<number | null>(
    conversationId ? parseInt(conversationId) : null
  );
  const [loading, setLoading] = useState(true);
  
  const myUserId = Number(localStorage.getItem("userId")); 
  const userRole = localStorage.getItem("userRole");
  const bottomRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Conversations & Connect Socket
  useEffect(() => {
    fetchConversations();
    
    // ✅ FIX: Add withCredentials for Cross-Site support on Render
    const newSocket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"] // Ensure fallback support
    });
    
    setSocket(newSocket);
    
    return () => { newSocket.disconnect(); };
  }, []);

  // 2. Load Messages When Active Conversation Changes
  useEffect(() => {
    if (activeConversation) {
      fetchHistory(activeConversation);
      socket?.emit("join_room", activeConversation);
      markAsRead(activeConversation);
      navigate(`/messages/${activeConversation}`, { replace: true });
    }
  }, [activeConversation]);

  // 3. Listen for Real-time Messages
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (data: any) => {
      const timeFormatted = new Date(data.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newMessage: Message = {
        sender_id: data.senderId,
        content: data.message,
        time: timeFormatted
      };
      
      // Append to chat window if open
      if (activeConversation === data.room || (!activeConversation && data.room)) {
         setMessageList((list) => [...list, newMessage]);
      }
      
      // Update sidebar preview
      const sidebarTime = formatDateForSidebar(new Date().toISOString());

      setConversations(prev => prev.map(conv => 
        conv.conversation_id === data.room
          ? { ...conv, last_message: data.message, last_message_time: sidebarTime }
          : conv
      ));
    });

    return () => { socket.off("receive_message"); };
  }, [socket, activeConversation]);

  // 4. Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  // --- API CALLS ---

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/messages/conversations");
      
      const formattedConversations = response.data.map((conv: any) => ({
        ...conv,
        last_message_time: formatDateForSidebar(conv.last_message_time)
      }));

      setConversations(formattedConversations);
      
      if (!activeConversation && formattedConversations.length > 0) {
        setActiveConversation(formattedConversations[0].conversation_id);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (convId: number) => {
    try {
      const res = await axiosInstance.get(`/messages/${convId}/messages`);
      const history = res.data.map((msg: any) => ({
        sender_id: msg.sender_id,
        content: msg.content,
        time: msg.sent_at 
            ? new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : "" 
      }));
      setMessageList(history);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

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

  const sendMessage = async () => {
    if (currentMessage.trim() === "" || !socket || !activeConversation) return;

    // Current time for the bubble (10:30 AM)
    const timeNowRaw = new Date();
    const timeForBubble = timeNowRaw.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Current time for the sidebar
    const timeForSidebar = formatDateForSidebar(timeNowRaw.toISOString());

    const activeConv = conversations.find(c => c.conversation_id === activeConversation);

    const messageData = {
      room: activeConversation,
      message: currentMessage,
      senderId: myUserId,
      recipientId: activeConv?.other_person_id,
      time: timeNowRaw.toISOString(),
    };

    socket.emit("send_message", messageData);

    // Optimistic UI update
    setMessageList((list) => [...list, { 
      sender_id: myUserId, 
      content: currentMessage, 
      time: timeForBubble 
    }]);
    
    // Update sidebar preview
    setConversations(prev => prev.map(conv =>
      conv.conversation_id === activeConversation
        ? { ...conv, last_message: currentMessage, last_message_time: timeForSidebar }
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

  // --- HELPER FOR BADGES ---
  const renderRoleBadge = (role?: string) => {
      if (role === 'Dietician') {
          return <span style={{fontSize:'0.7rem', backgroundColor:'#10b981', color:'white', padding:'2px 6px', borderRadius:'4px', marginLeft:'6px'}}>Dietician</span>;
      }
      if (role === 'Instructor') {
          return <span style={{fontSize:'0.7rem', backgroundColor:'#3b82f6', color:'white', padding:'2px 6px', borderRadius:'4px', marginLeft:'6px'}}>Instructor</span>;
      }
      return null;
  };

  return (
    <div className="messages-page-container">
      {/* Sidebar - Conversations List */}
      <div className="conversations-sidebar">
        <div className="sidebar-header">
          <button onClick={handleBackToDashboard} className="back-button">
            ← Back to Dashboard
          </button>
          <h1 className="sidebar-title">Messages</h1>
          <p className="sidebar-subtitle">{conversations.length} conversations</p>
        </div>

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
                    <h3 className="conversation-name">
                        {conv.other_person_name}
                        {renderRoleBadge(conv.other_person_role)}
                    </h3>
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
            <div className="chat-header">
              <div className="chat-header-avatar">
                {(activeConv?.other_person_name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="chat-header-info">
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <h2>{activeConv?.other_person_name || "Unknown User"}</h2>
                    {renderRoleBadge(activeConv?.other_person_role)}
                </div>
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