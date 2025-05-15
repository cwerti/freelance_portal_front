import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 
import "../styles/Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);  // Для ордеров
  const [reviews, setReviews] = useState([]); // Для отзывов
  const [loading, setLoading] = useState(true); // Убедимся, что это состояние контролируется
  const [error, setError] = useState("");
  const { id } = useParams();  // Получаем ID пользователя из URL
  const navigate = useNavigate();

  // Пример сопоставления ID роли с текстом
  const roleNames = {
    1: 'Заказчик',
    2: 'Фрилансер',
    3: 'Менеджер',
    4: 'Модератор',
  };

  useEffect(() => {
    const token = getCookie("access_token"); // Получаем токен из cookies

    if (!token) {
      console.log("Токен не найден, перенаправляем на страницу логина.");
      navigate("/login");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      console.log("Decoded Token:", decodedToken);  // Печатаем токен
      console.log("User ID from URL:", id);  // Печатаем ID из URL

      if (parseInt(decodedToken.id, 10) !== parseInt(id, 10)) {
        console.log("Неверный ID пользователя. Перенаправляем на страницу логина.");
        setError("Неверный ID пользователя.");
        navigate("/login");
        return;
      }

      fetchUserData(id, token);
      fetchOrders(id, token); // Загрузка ордеров
      fetchReviews(id, token); // Загрузка отзывов
    } catch (error) {
      console.log("Ошибка при декодировании токена:", error);
      setError("Ошибка при декодировании токена.");
      navigate("/login");
    }
  }, [id, navigate]);

  const fetchUserData = async (userId, token) => {
    try {
      console.log("Запрос данных пользователя...");
      const response = await fetch(`http://localhost:8000/user/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Данные пользователя:", data);  // Логируем данные пользователя
        setUserData(data);
      } else {
        console.error("Ошибка при получении данных пользователя:", response);
        setError("Не удалось загрузить данные пользователя");
      }
    } catch (err) {
      console.error("Ошибка при запросе данных пользователя:", err);
      setError("Ошибка при загрузке данных");
    }
  };

  const fetchOrders = async (userId, token) => {
    try {
      console.log("Запрос ордеров...");
      const response = await fetch(`http://localhost:8000/orders/by-author/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Ордера:", data);  // Логируем ордера
        setOrders(data);
      } else {
        console.error("Ошибка при получении ордеров:", response);
        setError("Не удалось загрузить ордера");
      }
    } catch (err) {
      console.error("Ошибка при запросе ордеров:", err);
      setError("Ошибка при загрузке ордеров");
    }
  };

  const fetchReviews = async (userId, token) => {
    try {
      console.log("Запрос отзывов...");
      const response = await fetch(`http://localhost:8000/reviews/user/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Отзывы:", data);  // Логируем отзывы
        setReviews(data);
      } else {
        console.error("Ошибка при получении отзывов:", response);
        setError("Не удалось загрузить отзывы");
      }
    } catch (err) {
      console.error("Ошибка при запросе отзывов:", err);
      setError("Ошибка при загрузке отзывов");
    }
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  // Убедимся, что loading меняется на false, когда данные загружены
  useEffect(() => {
    if (userData && orders && reviews) {
      setLoading(false);
    }
  }, [userData, orders, reviews]);

  if (loading) return <div>Загрузка...</div>;

  if (error) return <div className="error">{error}</div>;

  // Используем сопоставление роли для отображения названия роли
  const roleText = roleNames[userData.role_id] || "Неизвестная роль";

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Мой Профиль</h2>
        <p className="profile-role">Роль: {roleText}</p> {/* Отображаем название роли */}
      </div>

      <div className="profile-info">
        <div className="profile-avatar">
          <img
            src={userData.avatar || "default-avatar.png"}  
            alt="Avatar"
            className="avatar"
          />
        </div>

        <div className="profile-details">
          <p><strong>Логин:</strong> {userData.login}</p>
          <p><strong>Имя:</strong> {userData.firstName}</p>
          <p><strong>Фамилия:</strong> {userData.lastName}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Дата регистрации:</strong> {new Date(userData.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="profile-actions">
        <button className="edit-profile-btn">Редактировать профиль</button>
      </div>

      {/* Раздел с ордерами */}
      <div className="orders-section">
        <h3>Ордера</h3>
        <div className="orders-list">
          {orders.length === 0 ? (
            <p>Ордера не найдены.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="order-card">
                <h4>{order.title}</h4>
                <p><strong>Описание:</strong> {order.description}</p>
                <p><strong>Цена:</strong> {order.price}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Раздел с отзывами */}
      <div className="reviews-section">
        <h3>Отзывы</h3>
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p>Отзывов пока нет.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="review-card">
                <p><strong>Отзыв от:</strong> {review.reviewer_name}</p>
                <p>{review.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
