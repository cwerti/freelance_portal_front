import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Для декодирования токена
import '../styles/ProjectDetails.css';
import defaultImage from '../images/img2.jpg'; // Статический fallback для изображения

const ProjectDetails = () => {
  const { orderId } = useParams();  // Получаем ID ордера из URL
  const [orderData, setOrderData] = useState(null);
  const [image, setImage] = useState(null); // Для аватарки проекта
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreator, setIsCreator] = useState(false); // Флаг для проверки, является ли пользователь создателем
  const navigate = useNavigate();

  // Получаем авторизованный токен
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Декодирование токена и проверка на создателя ордера
  useEffect(() => {
    const token = getCookie('access_token');

    if (!token) {
      navigate('/login');
      return;
    }

    const decodedToken = jwtDecode(token);
    fetchOrderData(orderId, token, decodedToken.id);
  }, [orderId, navigate]);

  // Функция для загрузки данных ордера
  const fetchOrderData = async (orderId, token, userId) => {
    try {
      const response = await fetch(`http://localhost:8000/orders/by-order/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setOrderData(data);
        setIsCreator(data.authorId === userId);  // Проверяем, является ли текущий пользователь создателем ордера
      } else {
        setError('Не удалось загрузить данные ордера');
      }
    } catch (err) {
      setError('Ошибка при запросе данных ордера');
    } finally {
      setLoading(false);
    }
  };

  // Функция для удаления ордера
  const deleteOrder = async () => {
    const token = getCookie('access_token');
    try {
      const response = await fetch(`http://localhost:8000/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/orders'); // Перенаправляем на страницу ордеров
      } else {
        setError('Не удалось удалить ордер');
      }
    } catch (err) {
      setError('Ошибка при удалении ордера');
    }
  };

  // Функция для добавления аватарки
  const handleImageUpload = async (e) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    const token = getCookie('access_token');
    try {
      const response = await fetch(`http://localhost:8000/orders/update/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImage(data.avatar); // Обновляем аватарку
      } else {
        setError('Ошибка при загрузке аватарки');
      }
    } catch (err) {
      setError('Ошибка при загрузке аватарки');
    }
  };

  // Отображение при загрузке или ошибке
  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  // Отображаем детали ордера
  return (
    <div className="project-details-container">
      <h2>Детали проекта</h2>
      <div className="project-info">
        <h3>{orderData.name}</h3>
        <div className="project-item">
          <img src={image || defaultImage} className="project-image" alt="Project" />
          {isCreator && (
            <div>
              <input type="file" onChange={handleImageUpload} />
              <p>Загрузить аватарку</p>
            </div>
          )}
        </div>
        <p><strong>Категория:</strong> {orderData.categoryId === 1 ? 'IT' : orderData.categoryId === 2 ? 'Design' : 'Marketing'}</p>
        <p><strong>Бюджет:</strong> {orderData.startPrice}₽</p>
        <p><strong>Описание:</strong> {orderData.description}</p>
        <p><strong>Дата завершения:</strong> {new Date(orderData.deadline).toLocaleString()}</p>
      </div>

      {/* Функционал для удаления ордера */}
      {isCreator && (
        <div>
          <button onClick={deleteOrder}>Удалить ордер</button>
        </div>
      )}

      {/* Функция отклика */}
      <button>Откликнуться</button>
    </div>
  );
};

export default ProjectDetails;
