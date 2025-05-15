import React from "react";
import "../styles/Chats.css";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockChats, mockMessages } from "../components/MockData.js"


const Chats = ({ userId = 2 }) => { // Значение по умолчанию для демонстрации
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const navigate = useNavigate();

useEffect(() => {
    const fetchChats = async () => {
    try {
        // Обновляем чаты, добавляя последние сообщения из mockMessages
        const updatedChats = mockChats
        .filter(chat => chat.participants.includes(userId))
        .map(chat => {
            // Находим последнее сообщение для этого чата
            const chatMessages = mockMessages.filter(m => m.chatId === chat.id);
            const lastMessage = chatMessages[chatMessages.length - 1];
            
            return {
            ...chat,
            lastMessage: lastMessage?.text || '',
            lastMessageSender: lastMessage?.senderId || null,
            lastMessageTime: lastMessage?.time || chat.createdAt
            };
        });

        setChats(updatedChats);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

if (userId) {
    fetchChats();
    }
}, [userId, mockMessages]); // Добавляем зависимость от mockMessages

const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`); // ✅ Отдельный обработчик
};



if (loading) {
    return <div className="chat-page-body">Загрузка чатов...</div>;
}

if (error) {
    return <div className="chat-page-body">Ошибка: {error}</div>;
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
            {/* <div className="chat-conversation">
                {activeChat && <ChatBody chatId={activeChat} userId={userId} />}
            </div> */}
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