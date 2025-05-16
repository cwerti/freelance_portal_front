import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/OrdersList.css';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Тестовые данные (замените на реальный API запрос)
  const testOrders = [
    {
      id: 1,
      title: "Разработка сайта",
      category: "IT",
      budget: 15000,
      status: "active",
      description: "Корпоративный сайт для компании",
      deadline: "2023-12-31"
    },
    {
      id: 2,
      title: "Дизайн логотипа",
      category: "Design",
      budget: 5000,
      status: "pending",
      description: "Фирменный стиль для бренда",
      deadline: "2023-11-15"
    }
  ];

  useEffect(() => {
    // Имитация загрузки данных
    const fetchData = async () => {
      try {
        // Здесь должен быть реальный запрос:
        // const res = await fetch('/api/orders');
        // const data = await res.json();
        // setOrders(data);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        setOrders(testOrders);
      } catch (error) {
        console.error("Ошибка загрузки:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка заказов...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <header className="page-header">
        <h1>Список заказов</h1>
        <button 
          className="create-order-btn"
          onClick={() => navigate('/orders/new')}
        >
          + Создать заказ
        </button>
      </header>

      <div className="orders-grid">
        {orders.length > 0 ? (
          orders.map(order => (
            <article 
              key={order.id} 
              className="order-card"
              onClick={() => handleOrderClick(order.id)}
            >
              <h3>{order.title}</h3>
              <div className="order-meta">
                <span className={`status-badge ${order.status}`}>
                  {order.status === 'active' ? 'Активный' : 'В ожидании'}
                </span>
                <span className="category">{order.category}</span>
              </div>
              <p className="budget">Бюджет: {order.budget.toLocaleString()} ₽</p>
              <p className="deadline">Срок: {new Date(order.deadline).toLocaleDateString('ru-RU')}</p>
              <p className="description">{order.description}</p>
            </article>
          ))
        ) : (
          <div className="no-orders">
            <p>Нет доступных заказов</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersList;