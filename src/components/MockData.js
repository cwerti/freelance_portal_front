import React from "react";

export const mockChats = [
{
    id: 1,
    participantName: "Иван Иванов",
    participants: [1, 2], // Добавлен массив участников
    lastMessageTime: "2024-02-20T15:30:00",
    lastMessage: "Привет! Как дела?",
    lastMessageSender: 2
},
{
    id: 2,
    participantName: "Мария Петрова",
    participants: [2, 3],
    lastMessageTime: "2024-02-20T14:45:00",
    lastMessage: "Жду документы к обеду",
    lastMessageSender: 3
},
{
    id: 3,
    participantName: "Алексей Смирнов",
    participants: [1, 3],
    lastMessageTime: "2024-02-20T12:15:00",
    lastMessage: "Спасибо за помощь!",
    lastMessageSender: 1
}
];

export const mockMessages = [
{
    id: 1,
    chatId: 2,
    senderId: 3,
    text: "Привет! Как дела?",
    time: "2024-02-20T14:40:00"
},
{
    id: 2,
    chatId: 2,
    senderId: 2,
    text: "Всё хорошо, спасибо!",
    time: "2024-02-20T14:42:00"
},
{
    id: 6,
    chatId: 3,
    senderId: 1,
    text: "Спасибо за помощь!",
    time: "2024-02-20T12:15:00"
}
];
