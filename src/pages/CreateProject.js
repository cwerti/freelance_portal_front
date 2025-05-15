import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Используем named import
import "../styles/CreateProject.css";

const CreateProject = () => {
  const [name, setName] = useState("");              // Название проекта
  const [description, setDescription] = useState("");  // Описание проекта
  let [category, setCategory] = useState(0);        // Категория проекта (целое число)
  const [price, setPrice] = useState("");              // Цена
  const [deadline, setDeadline] = useState("");        // Дата завершения
  const [authorId, setAuthorId] = useState(null);      // AuthorId будет извлечен из токена
  const navigate = useNavigate();

  // Функция для получения авторизации из cookies
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  // Декодирование токена и извлечение authorId
  useEffect(() => {
    const token = getCookie("access_token"); // Получаем токен из cookies

    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Декодируем токен
        setAuthorId(decodedToken.id); // Извлекаем authorId из декодированного токена
      } catch (error) {
        console.error("Ошибка при декодировании токена:", error);
      }
    }
  }, []); // useEffect будет срабатывать только один раз при монтировании компонента

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!authorId) {
      console.error("Не удалось получить authorId");
      return;
    }
    if (category === 0){
      category = 1; // Устанавливаем дефолтное значение категории, если оно не выбрано
    }
    
    // Создание объекта данных для отправки на сервер
    const projectData = {
      "authorId": authorId,  // Динамический authorId
      "name": name,
      "description": description,
      "startPrice": price,
      "deadline": deadline,  // Преобразуем дату в строку, если необходимо
      "categoryId": category, // ID категории (целое число)
      "statusId": 1, // Статус по умолчанию равен 1
    };

    try {
      const response = await fetch("http://localhost:8000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const data = await response.json(); // Получаем данные ордера, включая его ID
        const orderId = data.id; // Предполагаем, что сервер возвращает ID созданного ордера

        // После создания ордера, перенаправляем на страницу этого ордера
        navigate(`/order/${orderId}`); // Перенаправляем на страницу ордера
      } else {
        console.error("Ошибка при создании ордера");
      }
    } catch (error) {
      console.error("Ошибка при отправке данных на сервер");
    }
  };

  return (
    <div className="create-project-container">
      <h2>Создать новый ордер</h2>
      <form onSubmit={handleSubmit} className="create-project-form">
        <div>
          <label>Название проекта</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label>Категория</label>
          <select
            value={category}
            onChange={(e) => setCategory(parseInt(e.target.value))}  // Преобразуем строку в целое число
            required
          >
            <option value={1}>IT</option>  {/* Здесь значение categoryId теперь будет числовым */}
            <option value={2}>Design</option>
            <option value={3}>Marketing</option>
          </select>
        </div>
        <div>
          <label>Цена</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Дата завершения</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
        <button type="submit">Создать ордер</button>
      </form>
    </div>
  );
};

export default CreateProject;
