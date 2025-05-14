import React from "react";
import "../styles/Chats.css";
import { useState, useEffect } from 'react';

const Chats = ({ userId }) => {
const [chats, setChats] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [activeChat, setActiveChat] = useState(null);

useEffect(() => {
    const fetchChats = async () => {
        try {
        const response = await fetch(`/api/chats/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch chats');
        }
        const data = await response.json();
        setChats(data);
        } catch (err) {
        setError(err.message);
        } finally {
        setLoading(false);
        }
};

    if (userId) {
        fetchChats();
    }
}, [userId]);

const handleChatClick = (chatId) => {
    setActiveChat(chatId);
};

if (loading) {
    return <div className="chat-page-body">Loading chats...</div>;
}

if (error) {
    return <div className="chat-page-body">Error: {error}</div>;
}

return (
    <div className="chat-page-body">
        <div className="chats-list">
        {chats.map((chat) => (
            <div
            className={`chat-card ${activeChat === chat.id ? 'active' : ''}`}
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
            >
            <div className="chat-info">
                <div className="chat-header">
                <h3 className="user-name">{chat.participantName}</h3>
                <span className="message-time">
                    {new Date(chat.lastMessageTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                    })}
                </span>
                </div>
                    
                <div className="chat-preview">
                <p className="last-message">
                    {chat.lastMessageSender === userId ? (
                    <span className="message-author">Вы: </span>
                    ) : null}
                    {chat.lastMessage}
                </p>
                </div>
            </div>
            </div>
        ))}
        </div>
    </div>
    );
};

export default Chats;