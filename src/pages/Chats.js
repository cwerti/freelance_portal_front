import React from "react";
import "../styles/Chats.css";
import { useState, useEffect } from 'react';
import Chat from './Chat';

// Мок-данные для тестирования
const mockChats = [
{
    id: 1,
    participantName: "Иван Иванов",
    lastMessageTime: "2024-02-20T15:30:00",
    lastMessage: "Привет! Как дела?",
    lastMessageSender: 2
},
{
    id: 2,
    participantName: "Мария Петрова",
    lastMessageTime: "2024-02-20T14:45:00",
    lastMessage: "Жду документы к обеду",
    lastMessageSender: 3
},
{
    id: 3,
    participantName: "Алексей Смирнов",
    lastMessageTime: "2024-02-20T12:15:00",
    lastMessage: "Спасибо за помощь!",
    lastMessageSender: 1
}
];

const Chats = ({ userId = 2 }) => { // Значение по умолчанию для демонстрации
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeChat, setActiveChat] = useState(null);

useEffect(() => {
    const fetchChats = async () => {
        try {
        
        // Для теста можно раскомментировать ошибку
        // throw new Error('Сервер не отвечает');
        
        // Используем мок-данные вместо реального запроса
        setChats(mockChats.filter(chat => 
            chat.lastMessageSender === userId || 
            chat.participantId === userId
        ));
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
    console.log('Selected chat ID:', chatId);
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
            <div className="chat-conversation">
                {activeChat && <ChatBody chatId={activeChat} userId={userId} />}
            </div>
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