import React from 'react';
import '../styles/ProjectDetails.css';
import img2 from '../images/img2.jpg';

const ProjectDetails = () => {
  return (
    <div className="project-details-container">
      <h2>Детали проекта</h2>
      <div className="project-info">
        <h3>Название проекта</h3>
        <div className='project-item'>
          <img src={img2}  className='project-image' alt={"img2"}/>
        </div>
        <p><strong>Категория:</strong> Разработка</p>
        <p><strong>Бюджет:</strong> 25 000₽</p>
        <p><strong>Описание:</strong> Нужно разработать веб-приложение с авторизацией, профилями и API.</p>
      </div>
      <button>Откликнуться</button>
    </div>
  );
};

export default ProjectDetails;
