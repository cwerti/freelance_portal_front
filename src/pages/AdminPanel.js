import React from "react";
import "../styles/AdminPanel.css";

const AdminPanel = () => {
  return (
    <div className="admin-panel">
      <div className="admin-container">
        <h1>Панель администратора</h1>
        <div className="admin-section">
          <h2>Пользователи</h2>
          <button>Просмотреть всех</button>
          <button>Заблокировать</button>
        </div>
        <div className="admin-section">
          <h2>Проекты</h2>
          <button>Все проекты</button>
          <button>Удалить проект</button>
        </div>
        <div className="admin-section">
          <h2>Отзывы</h2>
          <button>Модерация</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
