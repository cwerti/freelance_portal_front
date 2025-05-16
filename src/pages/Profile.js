import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  const roleNames = {
    1: "Заказчик",
    2: "Фрилансер",
    3: "Менеджер",
    4: "Модератор",
  };

  const categoryNames = {
    1: "IT",
    2: "Design",
    3: "Marketing",
  };

  useEffect(() => {
    const token = getCookie("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      if (parseInt(decodedToken.id, 10) !== parseInt(id, 10)) {
        setError("Неверный ID пользователя.");
        navigate("/login");
        return;
      }

      fetchUserData(id, token);
      fetchOrders(id, token);
      fetchReviews(id, token);
    } catch (error) {
      setError("Ошибка при декодировании токена.");
      navigate("/login");
    }
  }, [id, navigate]);

  const fetchUserData = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:8000/user/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        setError("Не удалось загрузить данные пользователя");
      }
    } catch (err) {
      setError("Ошибка при загрузке данных");
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchOrders = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:8000/orders/by-author/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const ordersWithCategoryNames = data.map(order => ({
          ...order,
          category_name: categoryNames[order.category_id] || `Категория ${order.category_id}`
        }));
        setOrders(ordersWithCategoryNames);
      }
    } catch (err) {
      console.error("Ошибка при загрузке ордеров:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchReviews = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:8000/reviews/user/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const formattedReviews = Array.isArray(data) 
          ? await Promise.all(data.map(async review => {
              // Получаем данные автора отзыва
              const reviewerResponse = await fetch(`http://localhost:8000/user/${review.reviewer_id}`, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                credentials: "include",
              });
              
              if (reviewerResponse.ok) {
                const reviewerData = await reviewerResponse.json();
                return {
                  id: review.id,
                  rating: review.rating,
                  comment: review.comment,
                  createdAt: new Date(review.created_at).toLocaleDateString('ru-RU'),
                  reviewerName: `${reviewerData.first_name} ${reviewerData.last_name}`,
                };
              }
              return {
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                createdAt: new Date(review.created_at).toLocaleDateString('ru-RU'),
                reviewerName: "Анонимный пользователь",
              };
            }))
          : [];
        setReviews(formattedReviews);
      }
    } catch (err) {
      console.error("Ошибка при загрузке отзывов:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  if (loadingUser) return <div className="loading">Загрузка профиля...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!userData) return <div className="error">Пользователь не найден</div>;

  const roleText = roleNames[userData.role_id] || "Неизвестная роль";

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Мой Профиль</h2>
        <p className="profile-role">Роль: {roleText}</p>
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
          <p><strong>Имя:</strong> {userData.first_name}</p>
          <p><strong>Фамилия:</strong> {userData.last_name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Дата регистрации:</strong> {new Date(userData.created_at).toLocaleDateString('ru-RU')}</p>
        </div>
      </div>

      <div className="profile-actions">
        <button className="edit-profile-btn">Редактировать профиль</button>
      </div>

      <div className="orders-section">
        <h3>Мои заказы</h3>
        <div className="orders-list">
          {loadingOrders ? (
            <p className="loading">Загрузка заказов...</p>
          ) : orders.length === 0 ? (
            <p className="empty-message">Заказов пока нет.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="order-card">
                <h4>{order.name}</h4>
                <p><strong>Категория:</strong> {order.category_name}</p>
                <p><strong>Цена:</strong> {order.start_price}₽</p>
                <p><strong>Описание:</strong> {order.description}</p>
                <p><strong>Ведет:</strong> {order.author_name}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="reviews-section">
        <h3>Отзывы обо мне</h3>
        <div className="reviews-list">
          {loadingReviews ? (
            <p className="loading">Загрузка отзывов...</p>
          ) : reviews.length === 0 ? (
            <p className="empty-message">Отзывов пока нет.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <span className="reviewer-name">{review.reviewerName}</span>
                  <div className="review-meta">
                    <span className="review-date">{review.createdAt}</span>
                    <span className="review-rating">
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </span>
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;