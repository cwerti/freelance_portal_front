import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { jwtDecode } from "jwt-decode"; 
=======
import { jwtDecode } from "jwt-decode"; // Правильный импорт
>>>>>>> main
import "../styles/Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();  // Получаем ID пользователя из URL
  const navigate = useNavigate();
<<<<<<< HEAD
  
  // Пример сопоставления ID роли с текстом
  const roleNames = {
    1: 'Заказчик',
    2: 'Фрилансер',
  };

  useEffect(() => {
    const token = getCookie("access_token"); // Получаем токен из cookies

    if (!token) {
=======

  useEffect(() => {
    const token = getCookie("token"); // Получаем токен из cookies

    if (!token) {
      // Если токен отсутствует, перенаправляем на страницу логина
>>>>>>> main
      navigate("/login");
      return;
    }

    try {
<<<<<<< HEAD
      const decodedToken = jwtDecode(token);

      if ('' + decodedToken.id !== id) {
=======
      // Декодируем токен и проверяем ID пользователя
      const decodedToken = jwt_decode(token);
      if (decodedToken.sub !== id) {
>>>>>>> main
        setError("Неверный ID пользователя.");
        navigate("/login");
        return;
      }

<<<<<<< HEAD
      fetchUserData(id, token);
    } catch (error) {
      setError("Ошибка при декодировании токена.");
=======
      // Запрашиваем данные пользователя с сервера
      fetchUserData(id, token);
    } catch (error) {
      console.error("Ошибка при декодировании токена:", error);
>>>>>>> main
      navigate("/login");
    }
  }, [id, navigate]);

  const fetchUserData = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:8000/user/${userId}`, {
        method: "GET",
<<<<<<< HEAD
        credentials: "include",
=======
>>>>>>> main
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
<<<<<<< HEAD
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
=======

      if (response.ok) {
        const data = await response.json();
        setUserData(data);  // Сохраняем данные пользователя
>>>>>>> main
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

<<<<<<< HEAD
  // Используем сопоставление роли
  const roleText = roleNames[userData.role_id] || "Неизвестная роль";

=======
>>>>>>> main
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Мой Профиль</h2>
<<<<<<< HEAD
        <p className="profile-role">Роль: {roleText}</p> {/* Здесь отображаем название роли */}
=======
        <p className="profile-role">Роль: {userData.role}</p>
>>>>>>> main
      </div>

      <div className="profile-info">
        <div className="profile-avatar">
          <img
<<<<<<< HEAD
            src={userData.avatar || "default-avatar.png"}  
=======
            src={userData.avatar || "default-avatar.png"}  // Показываем аватарку или изображение по умолчанию
>>>>>>> main
            alt="Avatar"
            className="avatar"
          />
        </div>

        <div className="profile-details">
          <p><strong>Логин:</strong> {userData.login}</p>
<<<<<<< HEAD
          <p><strong>Имя:</strong> {userData.first_name}</p>
          <p><strong>Фамилия:</strong> {userData.last_name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Дата регистрации:</strong> {new Date(userData.created_at).toLocaleDateString()}</p>
=======
          <p><strong>Имя:</strong> {userData.firstName}</p>
          <p><strong>Фамилия:</strong> {userData.lastName}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Дата регистрации:</strong> {new Date(userData.createdAt).toLocaleDateString()}</p>
>>>>>>> main
        </div>
      </div>

      <div className="profile-actions">
        <button className="edit-profile-btn">Редактировать профиль</button>
      </div>
    </div>
  );
};

export default Profile;
