import React, { useState } from "react";
import "../styles/Register.css";

const Register = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [roleId, setRoleId] = useState(1);  // Предполагаем, что роль по умолчанию - 1
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      login,
      password,
      email,
      lastName,
      firstName,
      roleId,
    };

    try {
      // Отправка POST-запроса на сервер
      const response = await fetch("http://localhost:8000/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),  // Отправляем данные для регистрации
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess("Регистрация прошла успешно!");  // Успех
        // Дополнительно можно перенаправить на страницу входа
        window.location.href = "/login";
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Ошибка регистрации");
      }
    } catch (error) {
      setError("Ошибка подключения к серверу");
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Регистрация</h2>

        <input
          type="text"
          placeholder="Логин"
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

        <input
          type="email"
          placeholder="Электронная почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Фамилия"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Имя"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <select
          value={roleId}
          onChange={(e) => setRoleId(Number(e.target.value))}
        >
          <option value={1}>Заказчик</option>
          <option value={2}>Фрилансер</option>
          {/* Добавьте другие роли по необходимости */}
        </select>

        {error && <p className="error">{typeof error === 'object' ? error.message || JSON.stringify(error) : error}</p>}
        {success && <p className="success">{typeof success === 'object' ? success.message || JSON.stringify(success) : success}</p>}

        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
};

export default Register;
