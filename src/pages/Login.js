import React, { useState } from "react";
import { redirect, useNavigate } from "react-router-dom"; // Для перенаправления
import "../styles/Login.css";
import Header from "../components/Header";

const Login = () => {
  const [login, setLogin] = useState("");  // Логин пользователя
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Для перенаправления после успешного логина

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login: login, password: password }),  // Отправляем login и password
      });
      if (response.ok) {
        const data = await response.json();
        addCookie("access_token", data[1], 3);

        window.location.href = '/';
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Не удалось авторизоваться");
      }
    } catch (error) {
      setError("Ошибка подключения к серверу");
    }
  };

  const addCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000); // Время действия cookie
    const expires = `expires=${date.toUTCString()}`;
    console.log(name, value);
    document.cookie = `${name}=${value}; ${expires}; path=/`; // Устанавливаем cookie
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Авторизация</h2>
        <input
          type="text"
          placeholder="Логин"  // Поле для логина
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Войти</button>
        <p className="signup-link">
          У вас нет учетной записи? <a href="/register">Зарегистрируйтесь</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
