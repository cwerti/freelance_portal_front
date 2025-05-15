import React from "react";
import "../styles/Chats.css";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const Chats = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);

    const getCookie = (name) => {
        const value = document.cookie.split('; ').find(row => row.startsWith(name));
        return value ? value.split('=')[1] : null;
    };

    useEffect(() => {
        const token = getCookie("access_token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            setUserId(decodedToken.id);
        } catch (error) {
            setError("Ошибка при декодировании токена");
            navigate("/login");
        }
    }, [navigate]);

useEffect(() => {
    const fetchChats = async () => {
        try {
            const token = getCookie("access_token");
            console.log("Токен авторизации:", token);
            
            // Получаем ID пользователя из токена
            const decodedToken = jwtDecode(token);
            const currentUserId = decodedToken.id;
            
            // Формируем URL с ID пользователя
            const response = await fetch(`http://localhost:8000/chats/${currentUserId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log("Статус ответа:", response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Ошибка сервера:", errorData);
                throw new Error(errorData.message || `Ошибка ${response.status}`);
            }

            const data = await response.json();
            console.log("Полученные данные:", data);
            
            setChats(data);

        } catch (err) {
            console.error("Полная ошибка:", err);
            setError(err.message);
            if (err.message.includes(401)) navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    fetchChats();
}, [navigate]);

    const handleChatClick = (chatId) => {
        navigate(`/chats/${chatId}`);
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