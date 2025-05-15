import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Chat.css';
import { mockChats, mockMessages } from "../components/MockData.js"


const ChatPage = ({ userId = 2 }) => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatInfo, setChatInfo] = useState(null);


useEffect(() => {
    // Загрузка информации о чате
    const chat = mockChats.find(c => c.id === parseInt(chatId));
    if (chat) {
    setChatInfo(chat);
    } else {
      navigate('/chats'); // Если чат не найден, возвращаемся назад
    }

    // Загрузка сообщений
    setMessages(mockMessages.filter(m => m.chatId === parseInt(chatId)));
}, [chatId, navigate]);

const handleSendMessage = () => {
    if (newMessage.trim()) {
    const newMsg = {
        id: messages.length + 1,
        chatId: parseInt(chatId),
        senderId: userId,
        text: newMessage,
        time: new Date().toISOString()
    };
    
      // Обновляем mockMessages
    mockMessages.push(newMsg);
    
      // Обновляем mockChats
    const chatIndex = mockChats.findIndex(c => c.id === parseInt(chatId));
    if (chatIndex > -1) {
        mockChats[chatIndex] = {
        ...mockChats[chatIndex],
        lastMessage: newMessage,
        lastMessageSender: userId,
        lastMessageTime: new Date().toISOString()
        };
    }

    setMessages([...messages, newMsg]);
    setNewMessage('');
    }
};


if (!chatInfo) return <div>Загрузка...</div>;

return (
    <div className="chat-container">
        <div className="chat-header">
        <button onClick={() => navigate(-1)} className="back-button">
            &lt; Назад
        </button>
        <h2>{chatInfo.participantName}</h2>
        </div>

        <div className="chat-messages">
        {messages.map((message) => (
            <div
            key={message.id}
            className={`message ${message.senderId === userId ? 'sent' : 'received'}`}
            >
            <div className="message-content">
                <p>{message.text}</p>
                <span className="message-time">
                {new Date(message.time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                </span>
            </div>
            </div>
        ))}
        </div>

        <div className="message-input">
        <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Отправить</button>
        </div>
    </div>
    );
};

export default ChatPage;