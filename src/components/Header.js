import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { Link } from "react-router-dom";
=======
import { Link, useNavigate } from "react-router-dom";
>>>>>>> main
import { jwtDecode } from "jwt-decode"; // Для декодирования токена
import "../styles/Header.css";
import { redirect, useNavigate } from "react-router-dom"; // Для перенаправления


const Header = () => {
  const [userData, setUserData] = useState(null); // Для хранения данных пользователя
  const navigate = useNavigate();
<<<<<<< HEAD
  useEffect(() => {
    console.log(document.cookie);
    const token = getCookie("access_token"); // Проверка наличия токена
    console.log(token);
=======

  useEffect(() => {
    const token = getCookie("access_token"); // Проверка наличия токена

    console.log("Токен из cookies:", token);  // Логирование токена для проверки

>>>>>>> main
    if (token) {
      try {
        // Декодируем токен и получаем информацию о пользователе
        const decodedToken = jwtDecode(token);
<<<<<<< HEAD
        // Получаем данные пользователя с сервера
        fetchUserData(decodedToken.id, token); // sub - это ID пользователя
=======
        console.log("Декодированный токен:", decodedToken); // Логируем декодированный токен
        // Получаем данные пользователя с сервера
        fetchUserData(decodedToken.sub, token); // sub - это ID пользователя
>>>>>>> main
      } catch (error) {
        console.error("Ошибка при декодировании токена:", error);
      }
    }
<<<<<<< HEAD
  }, []
);
=======
  }, []);
>>>>>>> main

  const fetchUserData = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:8000/user/${userId}`, {
        method: "GET",
<<<<<<< HEAD
        credentials: "include"
      });
      
      if (response.ok) {
        const data = await response.json();
        // console.log(data);
=======
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
>>>>>>> main
        setUserData(data); // Сохраняем данные пользователя в состояние
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
<<<<<<< HEAD
    console.log(parts);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };
=======
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

>>>>>>> main
  const handleLogout = () => {
    // Удаляем токен из cookies
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUserData(null); // Очищаем данные пользователя
    navigate("/login"); // Перенаправляем на страницу логина
  };

<<<<<<< HEAD
  const handleProfile = () => {
    window.location.href = `/profile/${userData.id}`;
  

  }
=======
>>>>>>> main
  return (
    <header className="header">
      <Link to="/" className="logo">
        <span>Freelance_</span>
        <span className="studio">STUdio</span>
      </Link>

      {userData ? (
<<<<<<< HEAD

=======
>>>>>>> main
        <div className="user-info">
          <span className="user-name">
            {userData.firstName} {userData.lastName}
          </span>
          <button onClick={handleLogout} className="auth-btn">Выйти</button>
<<<<<<< HEAD
          <button onClick={handleProfile} className="auth-btn">Профиль</button>

=======
          <Link to={`/profile/${userData.id}`} className="auth-btn">
            Профиль
          </Link>
>>>>>>> main
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
