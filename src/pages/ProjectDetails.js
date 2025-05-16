import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../styles/ProjectDetails.css';

const ProjectDetails = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthor, setIsAuthor] = useState(false);
  const { orderId } = useParams();
  const navigate = useNavigate();

  const categoryNames = {
    1: "IT",
    2: "Design",
    3: "Marketing",
  };

  useEffect(() => {
    const token = getCookie('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchOrder(orderId, token);
  }, [orderId, navigate]);

  const fetchOrder = async (id, token) => {
    try {
      const response = await fetch(`http://localhost:8000/orders/by-order/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const decodedToken = jwtDecode(token);
        setIsAuthor(decodedToken.id === data.author_id);
        setOrder({
          ...data,
          category_name: categoryNames[data.category_id] || `Категория ${data.category_id}`
        });
      } else {
        setError('Не удалось загрузить заказ');
      }
    } catch (err) {
      setError('Ошибка при загрузке заказа');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    const token = getCookie('access_token');
    try {
      const response = await fetch(`http://localhost:8000/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/orders');
      } else {
        setError('Не удалось удалить заказ');
      }
    } catch (err) {
      setError('Ошибка при удалении заказа');
    }
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  if (loading) return <div className="loading">Загрузка заказа...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div className="error">Заказ не найден</div>;

  return (
    <div className="project-details-container">
      <div className="project-header">
        <h2>{order.name}</h2>
        {isAuthor && (
          <button className="delete-btn" onClick={handleDeleteOrder}>
            Удалить заказ
          </button>
        )}
      </div>

      <div className="project-info">
        <div className="project-meta">
          <p><strong>Категория:</strong> {order.category_name}</p>
          <p><strong>Цена:</strong> {order.start_price}₽</p>
          <p><strong>Статус:</strong> {order.status}</p>
          <p><strong>Дата создания:</strong> {new Date(order.created_at).toLocaleDateString('ru-RU')}</p>
        </div>

        <div className="project-description">
          <h3>Описание</h3>
          <p>{order.description}</p>
        </div>

        {/* Дополнительные поля заказа можно добавить здесь */}
      </div>
    </div>
  );
};

export default ProjectDetails;