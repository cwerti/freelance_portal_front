import React from 'react';
import '../styles/CreateProject.css';

const CreateProject = () => {
  return (
    <div className="create-project-container">
      <h2>Создание проекта</h2>
      <form className="project-form">
        <label>
          Название проекта:
          <input type="text" placeholder="Введите название" />
        </label>
        <label>
          Описание:
          <textarea placeholder="Опишите ваш проект" />
        </label>
        <label>
          Бюджет:
          <input type="number" placeholder="Введите сумму" />
        </label>
        <label>
          Категория:
          <select>
            <option>Дизайн</option>
            <option>Разработка</option>
            <option>Тексты</option>
          </select>
        </label>
        <button type="submit">Создать</button>
      </form>
    </div>
  );
};

export default CreateProject;
