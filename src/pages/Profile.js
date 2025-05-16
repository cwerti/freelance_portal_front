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
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
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
      const currentUser = parseInt(decodedToken.id, 10) === parseInt(id, 10);
      setIsCurrentUser(currentUser);

      const fetchData = async () => {
        await fetchUserData(id, token);
        if (currentUser) {
          await fetchOrders(id, token);
        } else {
          setLoadingOrders(false);
        }
        await fetchReviews(id, token);
      };

      fetchData();
    } catch (error) {
      setError("Ошибка при декодировании токена");
      console.error("Ошибка декодирования токена:", error);
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
        throw new Error("Не удалось загрузить данные пользователя");
      }
    } catch (err) {
      setError(err.message);
      console.error("Ошибка загрузки данных пользователя:", err);
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
      } else {
        throw new Error("Не удалось загрузить заказы");
      }
    } catch (err) {
      console.error("Ошибка загрузки заказов:", err);
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
        const formattedReviews = await Promise.all(data.map(async review => {
          try {
            const reviewerResponse = await fetch(`http://localhost:8000/user/${review.reviewerId}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
            });

            const reviewerData = reviewerResponse.ok ? await reviewerResponse.json() : null;
            const decodedToken = jwtDecode(token);
            const canDelete = parseInt(decodedToken.id, 10) === review.reviewerId;

            return {
              ...review,
              createdAt: formatDate(review.createdAt),
              reviewerName: reviewerData 
                ? `${reviewerData.firstName} ${reviewerData.lastName}`
                : "Анонимный пользователь",
              canDelete
            };
          } catch (err) {
            console.error("Ошибка загрузки автора отзыва:", err);
            return {
              ...review,
              createdAt: formatDate(review.createdAt),
              reviewerName: "Анонимный пользователь",
              canDelete: false
            };
          }
        }));
        setReviews(formattedReviews);
      } else {
        throw new Error("Не удалось загрузить отзывы");
      }
    } catch (err) {
      console.error("Ошибка загрузки отзывов:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return dateString;
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = getCookie("access_token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const reviewData = {
        comment: newReview.comment,
        rating: newReview.rating,
        reviewerId: parseInt(decodedToken.id, 10),
        reviewedId: parseInt(id, 10),
        createdAt: new Date().toISOString()
      };

      console.log("Отправка отзыва:", reviewData);

      const response = await fetch(`http://localhost:8000/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail?.[0]?.msg || "Ошибка при отправке отзыва");
      }

      setNewReview({ rating: 5, comment: "" });
      setError("");
      await fetchReviews(id, token);
    } catch (err) {
      setError(err.message);
      console.error("Ошибка отправки отзыва:", err);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    const token = getCookie("access_token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    if (!window.confirm("Вы уверены, что хотите удалить этот отзыв?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Не удалось удалить отзыв");
      }

      await fetchReviews(id, token);
    } catch (err) {
      setError(err.message);
      console.error("Ошибка удаления отзыва:", err);
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
  const token = getCookie("access_token");
  const currentUserId = token ? parseInt(jwtDecode(token).id, 10) : null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>{isCurrentUser ? "Мой профиль" : "Профиль пользователя"}</h2>
        <p className="profile-role">Роль: {roleText}</p>
        {isCurrentUser && <p className="current-user-badge">Это ваш профиль</p>}
      </div>

      <div className="profile-info">
        <div className="profile-details">
          <p><strong>Логин:</strong> {userData.login}</p>
          <p><strong>Имя:</strong> {userData.first_name}</p>
          <p><strong>Фамилия:</strong> {userData.last_name}</p>
          {isCurrentUser && (
            <>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Дата регистрации:</strong> {formatDate(userData.created_at)}</p>
            </>
          )}
        </div>
      </div>

      {isCurrentUser && (
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
      )}

      <div className="reviews-section">
        <h3>Отзывы {isCurrentUser ? "обо мне" : "о пользователе"}</h3>
        
        {!isCurrentUser && currentUserId && (
          <div className="add-review-form">
            <h4>Оставить отзыв</h4>
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label>Оценка:</label>
                <select 
                  value={newReview.rating}
                  onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                  required
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} ★</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Комментарий:</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  required
                  minLength={3}
                  maxLength={500}
                />
              </div>
              <button type="submit" className="submit-review-btn">
                Отправить отзыв
              </button>
              {error && <p className="error-message">{error}</p>}
            </form>
          </div>
        )}

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
                {review.canDelete && (
                  <button 
                    onClick={() => handleReviewDelete(review.id)}
                    className="delete-review-btn"
                  >
                    Удалить отзыв
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;