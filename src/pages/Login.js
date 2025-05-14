import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Для перенаправления
import "../styles/Login.css";

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
        
        // Если вход успешен, перенаправляем на главную страницу (или на страницу профиля)
        navigate("/"); // Переход на главную страницу
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Не удалось авторизоваться");
      }
    } catch (error) {
      setError("Ошибка подключения к серверу");
    }
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
