import React, { useState, useEffect, useRef } from "react";
import "../styles/Chat.css";

const Chat = ({ chatId, userId = 2 }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    // Мок-данные сообщений по chatId
    const mockMessages = {
        1: [
            { id: 1, senderId: 2, text: "Привет! Как дела?", timestamp: "2024-02-20T15:30:00" },
            { id: 2, senderId: 1, text: "Отлично, спасибо!", timestamp: "2024-02-20T15:31:00" },
            { id: 3, senderId: 2, text: "Рад слышать!", timestamp: "2024-02-20T15:32:00" }
        ],
        2: [
            { id: 4, senderId: 3, text: "Жду документы к обеду", timestamp: "2024-02-20T14:45:00" },
            { id: 5, senderId: 2, text: "Хорошо, отправлю через час", timestamp: "2024-02-20T14:50:00" }
        ],
        3: [
            { id: 6, senderId: 1, text: "Спасибо за помощь!", timestamp: "2024-02-20T12:15:00" },
            { id: 7, senderId: 2, text: "Не за что, всегда рад помочь!", timestamp: "2024-02-20T12:16:00" }
        ]
    };

    // Загрузка сообщений при изменении chatId
    useEffect(() => {
        if (chatId && mockMessages[chatId]) {
            setMessages(mockMessages[chatId]);
        } else {
            setMessages([]);
        }
    }, [chatId]);

    // Прокрутка вниз при добавлении новых сообщений
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            id: Date.now(),
            senderId: userId,
            text: newMessage,
            timestamp: new Date().toISOString()
        };

        setMessages((prev) => [...prev, message]);
        setNewMessage("");
    };

    return (
        <div className="chat-container">
            <div className="chat-window">
                <div className="messages-container">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message ${msg.senderId === userId ? "sent" : "received"}`}
                        >
                            <div className="message-content">
                                <p>{msg.text}</p>
                                <span className="message-time">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form className="message-input-form" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Введите сообщение..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit">➤</button>
                </form>
            </div>
        </div>
    );
};

export default Chat;