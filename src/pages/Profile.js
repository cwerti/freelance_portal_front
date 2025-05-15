import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Правильный импорт
import "../styles/Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();  // Получаем ID пользователя из URL
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = getCookie("access_token"); // Получаем токен из cookies
    console.log(token);

    if (!token) {
      // Если токен отсутствует, перенаправляем на страницу логина
      navigate("/login");
      return;
    }

    try {
      // Декодируем токен и проверяем ID пользователя
      const decodedToken = jwtDecode(token);
      
      if ('' + decodedToken.id !== id) {
        setError("Неверный ID пользователя.");
        navigate("/login");
        return;
      }

      // Запрашиваем данные пользователя с сервера
      fetchUserData(id, token);
    } catch (error) {
      console.error("Ошибка при декодировании токена:", error);
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
      console.log(response)
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
    console.log(parts);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  if (loading) return <div>Загрузка...</div>;

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Мой Профиль</h2>
        <p className="profile-role">Роль: {userData.role_id}</p>
      </div>

      <div className="profile-info">
        <div className="profile-avatar">
          <img
            src={userData.avatar || "default-avatar.png"}  // Показываем аватарку или изображение по умолчанию
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
    </div>
  );
};

export default Profile;
