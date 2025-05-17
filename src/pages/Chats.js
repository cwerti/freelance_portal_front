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
    const [unreadMessages, setUnreadMessages] = useState(new Set());
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [ws, setWs] = useState(null);

    const getCookie = (name) => {
        const value = document.cookie.split('; ').find(row => row.startsWith(name));
        return value ? value.split('=')[1] : null;
    };

    // Функция обновления последнего сообщения в чате
    const updateLastMessage = (chatId, newMessage, authorId) => {
        console.log("Обновление сообщения:", { chatId, newMessage, authorId });
        
        setChats(prevChats => {
            return prevChats.map(chat => {
                // Проверяем соответствие ID чата
                if (chat.chat_association && 
                    parseInt(chat.chat_association.chat_id) === parseInt(chatId)) {
                    
                    // Добавляем анимацию и отмечаем как непрочитанное
                    const chatElement = document.querySelector(`[data-chat-id="${chat.chat_association.chat_id}"]`);
                    if (chatElement) {
                        // Удаляем предыдущие классы анимации
                        chatElement.classList.remove('new-message');
                        // Форсируем перерисовку
                        void chatElement.offsetWidth;
                        // Добавляем класс анимации
                        chatElement.classList.add('new-message');
                    }

                    // Если сообщение от другого пользователя, отмечаем как непрочитанное
                    if (authorId && parseInt(authorId) !== parseInt(userId)) {
                        setUnreadMessages(prev => new Set([...prev, parseInt(chatId)]));
                    }

                    // Обновляем данные чата
                    return {
                        ...chat,
                        last_message: {
                            text: newMessage,
                            created_at: new Date().toISOString(),
                            author_id: authorId ? parseInt(authorId) : null
                        }
                    };
                }
                return chat;
            });
        });
    };

    // Создание чата с технической поддержкой
    const createSupportChat = async (currentUserId) => {
        try {
            // Проверяем существование ассоциации с поддержкой
            const assocResponse = await fetch(`http://localhost:8000/chats/associations/user/1`, {
                credentials: 'include'
            });
            const existingAssoc = await assocResponse.json();

            // Если ассоциация уже существует, не создаем новый чат
            if (existingAssoc) {
                return;
            }

            // Создаем новый чат
            const chatResponse = await fetch('http://localhost:8000/chats/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: "Техническая поддержка",
                    clientId: currentUserId,
                    orderId: 1
                })
            });

            if (!chatResponse.ok) {
                throw new Error('Ошибка при создании чата поддержки');
            }

            const chatId = await chatResponse.json();

            // Создаем ассоциацию для чата
            const assocCreateResponse = await fetch('http://localhost:8000/chats/associations/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    clientId: currentUserId,
                    executorId: 1, // ID технической поддержки
                    chatId: chatId
                })
            });

            if (!assocCreateResponse.ok) {
                throw new Error('Ошибка при создании ассоциации чата');
            }

            // Обновляем список чатов
            fetchChats();

        } catch (error) {
            console.error('Ошибка при создании чата поддержки:', error);
        }
    };

    // Установка WebSocket соединения
    useEffect(() => {
        const token = getCookie("access_token");
        if (!token) return;

        const socket = new WebSocket(`ws://localhost:8000/ws`);
        
        socket.onopen = () => {
            console.log("WebSocket соединение установлено");
            socket.send(JSON.stringify({ 
                Authorization: token,
                type: "CONNECT",
                body: {}
            }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Получено сообщение:", data);
            
            // Проверяем структуру сообщения
            if (data.message) {
                // Если сообщение приходит в старом формате
                const chatId = activeChat; // Используем текущий активный чат
                updateLastMessage(chatId, data.message, userId);
            } else if (data.type === "SEND_MESSAGE" && data.body) {
                // Если сообщение приходит в новом формате
                const message = data.body.message;
                const chatId = data.body.chat_id;
                const authorId = data.body.author_id;

                // Показываем уведомление только если это не наше сообщение
                if (parseInt(authorId) !== parseInt(userId)) {
                    alert( message );
                }

                // Обновляем последнее сообщение в чате
                if (chatId) {
                    updateLastMessage(chatId, message, authorId);
                }
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket ошибка:", error);
        };

        socket.onclose = () => {
            console.log("WebSocket соединение закрыто");
        };

        setWs(socket);

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [userId, activeChat]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const token = getCookie("access_token");
                console.log("Токен авторизации:", token);
                
                // Получаем ID пользователя из токена
                const decodedToken = jwtDecode(token);
                const currentUserId = decodedToken.id;
                setUserId(currentUserId);

                // Создаем чат с поддержкой, если его нет
                await createSupportChat(currentUserId);
                
                // Получаем список чатов
                const response = await fetch(`http://localhost:8000/chats/get_my_chats`, {
                    method: 'POST',
                    credentials: 'include'
                });

                console.log("Статус ответа:", response.status);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Ошибка сервера:", errorData);
                    throw new Error(errorData.message || `Ошибка ${response.status}`);
                }

                const data = await response.json();
                console.log("Полученные данные:", data);

                // Сортируем чаты так, чтобы чат поддержки был первым
                const sortedChats = data.sort((a, b) => {
                    // Если это чат с поддержкой (ID пользователя 1), он должен быть первым
                    if (a.companion.id === 1) return -1;
                    if (b.companion.id === 1) return 1;
                    return 0;
                });
                
                setChats(sortedChats);

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
        // Убираем отметку о непрочитанном сообщении
        setUnreadMessages(prev => {
            const newSet = new Set(prev);
            newSet.delete(parseInt(chatId));
            return newSet;
        });
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
                        className={`chat-card ${
                            activeChat === chat.chat_association.chat_id ? 'active' : ''
                        } ${chat.companion.id === 1 ? 'support-chat' : ''} ${
                            unreadMessages.has(parseInt(chat.chat_association.chat_id)) ? 'unread' : ''
                        }`}
                        key={chat.chat_association.chat_id}
                        data-chat-id={chat.chat_association.chat_id}
                        onClick={() => handleChatClick(chat.chat_association.chat_id)}
                    >
                        <div className="chat-info">
                            <div className="chat-header">
                                <h3 className="user-name">
                                    {chat.companion.id === 1 ? '🛠️ ' : ''}{chat.companion.login}
                                </h3>
                                <span className="message-time">
                                    {chat.last_message && chat.last_message.created_at ? 
                                        new Date(chat.last_message.created_at).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : ''
                                    }
                                </span>
                            </div>
                            <div className="chat-preview">
                                <p className="last-message">
                                    {chat.last_message && chat.last_message.author_id === userId ? (
                                        <span className="message-author">Вы: </span>
                                    ) : null}
                                    {chat.last_message ? chat.last_message.text : 'Нет сообщений'}
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