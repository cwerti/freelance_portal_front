import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 
import "../styles/Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();  // Получаем ID пользователя из URL
  const navigate = useNavigate();
  
  // Пример сопоставления ID роли с текстом
  const roleNames = {
    1: 'Заказчик',
    2: 'Фрилансер',
  };

  useEffect(() => {
    const token = getCookie("access_token"); // Получаем токен из cookies

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);

      if ('' + decodedToken.id !== id) {
        setError("Неверный ID пользователя.");
        navigate("/login");
        return;
      }

      fetchUserData(id, token);
    } catch (error) {
      setError("Ошибка при декодировании токена.");
      navigate("/login");
    }
  }, [id, navigate]);

  const fetchUserData = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:8000/user/${userId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
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
      setLoading(false);
    }
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  if (loading) return <div>Загрузка...</div>;

  if (error) return <div className="error">{error}</div>;

  // Используем сопоставление роли
  const roleText = roleNames[userData.role_id] || "Неизвестная роль";

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Мой Профиль</h2>
        <p className="profile-role">Роль: {roleText}</p> {/* Здесь отображаем название роли */}
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
          <p><strong>Дата регистрации:</strong> {new Date(userData.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="profile-actions">
        <button className="edit-profile-btn">Редактировать профиль</button>
      </div>
    </div>
  );
};

export default Profile;
