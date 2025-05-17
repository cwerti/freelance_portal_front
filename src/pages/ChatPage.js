import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import '../styles/Chat.css';

const ChatPage = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatInfo, setChatInfo] = useState(null);
    const [chatAssociation, setChatAssociation] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [ws, setWs] = useState(null);
    const chatBoxRef = useRef(null);

    // Получение токена из куки
    const getToken = () => {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('access_token='))
            ?.split('=')[1];
        return token;
    };

    // Форматирование сообщений из API
    const formatMessage = (message, currentUserId) => {
        if (!message || !message.id || !message.text) {
            console.error('Некорректное сообщение:', message);
            return null;
        }
        
        return {
            id: message.id,
            text: message.text,
            isOutgoing: parseInt(message.author_id) === parseInt(currentUserId),
            time: message.created_at || message.updated_at || new Date().toISOString()
        };
    };

    // Функция для отображения сообщений
    const displayMessage = (message, isOutgoing) => {
        const newMsg = {
            id: Date.now(),
            text: message,
            isOutgoing,
            time: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMsg]);
    };

    // Функция отправки сообщения
    const sendMessage = async () => {
        if (newMessage.trim() && ws && chatAssociation && currentUser) {
            try {
                // Сохраняем сообщение в БД
                const response = await fetch('http://localhost:8000/chats/message/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        authorId: currentUser.id,
                        chatId: parseInt(chatId),
                        text: newMessage.trim()
                    })
                });

                if (!response.ok) {
                    throw new Error('Не удалось сохранить сообщение');
                }

                // Отправляем сообщение через WebSocket
                const messageData = {
                    type: "SEND_MESSAGE",
                    body: {
                        recipient: chatAssociation.executor_id === currentUser.id 
                            ? chatAssociation.client_id 
                            : chatAssociation.executor_id,
                        message: newMessage,
                        chat: chatInfo
                    }
                };  
                ws.send(JSON.stringify(messageData));
                
                displayMessage(newMessage, true);
                setNewMessage('');
            } catch (error) {
                console.error('Ошибка при отправке сообщения:', error);
                alert('Не удалось отправить сообщение. Попробуйте еще раз.');
            }
        }
    };

    // Загрузка информации о текущем пользователе из токена
    useEffect(() => {
        const token = getToken();
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCurrentUser(decoded);
            } catch (error) {
                console.error('Ошибка при декодировании токена:', error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // Загрузка данных чата и установка WebSocket соединения
    useEffect(() => {
        if (!currentUser || !chatId) return;

        const fetchChatData = async () => {
            try {
                // Получаем информацию о чате
                const chatResponse = await fetch(`http://localhost:8000/chats/${chatId}`, {
                    credentials: 'include'
                });
                if (!chatResponse.ok) throw new Error('Не удалось загрузить данные чата');
                const chatData = await chatResponse.json();
                setChatInfo(chatData);

                // Получаем информацию об ассоциации чата
                const assocResponse = await fetch(`http://localhost:8000/chats/associations/${chatId}`, {
                    credentials: 'include'
                });
                if (!assocResponse.ok) throw new Error('Не удалось загрузить данные ассоциации');
                const assocData = await assocResponse.json();
                setChatAssociation(assocData);

                // Загружаем историю сообщений
                console.log('Загрузка сообщений для чата:', chatId);
                const messagesResponse = await fetch(`http://localhost:8000/chats/messages/${chatId}`, {
                    credentials: 'include'
                });
                if (!messagesResponse.ok) throw new Error('Не удалось загрузить историю сообщений');
                const messagesData = await messagesResponse.json();
                console.log('Получены сырые данные сообщений:', messagesData);
                
                // Проверяем, что messagesData это массив
                if (Array.isArray(messagesData)) {
                    // Форматируем и устанавливаем сообщения
                    const formattedMessages = messagesData
                        .filter(msg => msg !== null && msg.text !== null) // Фильтруем невалидные сообщения
                        .map(msg => formatMessage(msg, currentUser.id))
                        .filter(msg => msg !== null) // Фильтруем сообщения, которые не прошли форматирование
                        .sort((a, b) => new Date(a.time) - new Date(b.time)); // Сортируем по времени
                    
                    console.log('Отформатированные сообщения:', formattedMessages);
                    setMessages(formattedMessages);
                } else {
                    console.error('Получены неверные данные сообщений:', messagesData);
                    setMessages([]);
                }

                // Устанавливаем WebSocket соединение
                const socket = new WebSocket(`ws://localhost:8000/ws`);
                
                socket.onopen = () => {
                    console.log("WebSocket соединение установлено");
                    const token = getToken();
                    socket.send(JSON.stringify({ 
                        Authorization: token,
                        type: "CONNECT",
                        body: {}
                    }));
                };

                socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    console.log("Получено сообщение:", data);
                    if (data.type === "SEND_MESSAGE") {
                        displayMessage(data.body.message, false);
                    }
                };

                socket.onerror = (error) => {
                    console.error("WebSocket ошибка:", error);
                };

                setWs(socket);

                return () => {
                    console.log("Закрытие WebSocket соединения");
                    socket.close();
                };
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                navigate('/chats');
            }
        };

        fetchChatData();
    }, [chatId, currentUser, navigate]);

    // Автопрокрутка при новых сообщениях
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    if (!chatInfo || !chatAssociation) {
        return <div className="chat-container">
            <div className="chat-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    &lt; Назад
                </button>
                <h2>Загрузка...</h2>
            </div>
        </div>;
    }

    // Определяем имя собеседника
    const participantName = chatInfo.name || "Чат";

    return (
        <div className="chat-container">
            <div className="chat-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    &lt; Назад
                </button>
                <h2>{participantName}</h2>
            </div>

            <div id="chat-box" className="chat-messages" ref={chatBoxRef}>
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>Нет сообщений</p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => {
                            console.log('Рендеринг сообщения:', message); // Отладочный вывод
                            return (
                                <div
                                    key={message.id}
                                    className={`message ${message.isOutgoing ? 'sent' : 'received'}`}
                                >
                                    <div className="message-content">
                                        <p>{message.text}</p>
                                        <span className="message-time">
                                            {new Date(message.time).toLocaleString('ru-RU', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            <div className="message-input">
                <textarea
                    id="message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                    rows="3"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                />
                <button onClick={sendMessage}>Отправить</button>
            </div>
        </div>
    );
};

export default ChatPage;