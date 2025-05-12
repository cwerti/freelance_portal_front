import React from 'react';
import '../styles/ProjectDetails.css';

const ProjectDetails = () => {
  return (
    <div className="project-details-container">
      <h2>Детали проекта</h2>
      <div className="project-info">
        <h3>Название проекта</h3>
        <p><strong>Категория:</strong> Разработка</p>
        <p><strong>Бюджет:</strong> 25 000₽</p>
        <p><strong>Описание:</strong> Нужно разработать веб-приложение с авторизацией, профилями и API.</p>
      </div>
      <button>Откликнуться</button>
    </div>
  );
};

export default ProjectDetails;
