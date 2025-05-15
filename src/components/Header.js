import React, { useEffect, useState } from "react";

import { Link, useNavigate, redirect } from "react-router-dom";

import { jwtDecode } from "jwt-decode"; 
import "../styles/Header.css";


const Header = () => {
  const [userData, setUserData] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie("access_token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        fetchUserData(decodedToken.id, token); 
      } catch (error) {
        console.error("Ошибка при декодировании токена:", error);
      }
    }
  }, []);

  const fetchUserData = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:8000/user/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error("Не удалось получить данные пользователя");
      }
    } catch (err) {
      console.error("Ошибка при загрузке данных пользователя", err);
    }
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const handleLogout = () => {
    // Удаляем токен из cookies
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUserData(null); // Очищаем данные пользователя
    navigate("/login"); // Перенаправляем на страницу логина
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        <span>Freelance_</span>
        <span className="studio">STUdio</span>
      </Link>

      {userData ? (
        <div className="user-info">
          <span className="user-name">
            {userData.firstName} {userData.lastName}
          </span>
          <button onClick={handleLogout} className="auth-btn">Выйти</button>
          <Link to={`/profile/${userData.id}`}>
            <button className="auth-btn">Профиль</button>
          </Link>
          <Link to="/chats">
            <button className="auth-btn">Чаты</button> {/* Добавляем кнопку чатов */}
          </Link>
          <Link to="/create-project">
            <button className="auth-btn create-btn">Создать ордер</button>
          </Link>
        </div>
      ) : (
        <div className="auth-buttons">
          <Link to="/login">
            <button className="auth-btn">Войти</button>
          </Link>
          <Link to="/register">
            <button className="auth-btn">Зарегистрироваться</button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
