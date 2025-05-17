import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 
import "../styles/Header.css";

const Header = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie("access_token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        fetchUserData(decodedToken.id, token);
        fetchCategories(token);
      } catch (error) {
        console.error("Ошибка при декодировании токена:", error);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCategories = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/orders/categories', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Ошибка при загрузке категорий:', err);
    }
  };

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

  const handleLogout = () => {
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUserData(null);
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          Freelance Portal
        </Link>

        <nav className="nav-menu">
          <Link to="/" className="nav-link">Главная</Link>
          
          <div className="dropdown">
            <button className="dropdown-btn">Категории</button>
            <div className="dropdown-content">
              {categories.map(category => (
                <Link
                  key={category.id}
                  to={`/category/${category.name}`}
                  className="dropdown-link"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {userData ? (
            <>
              <Link to="/create-project" className="nav-link">Создать проект</Link>
              <Link to="/chats" className="nav-link">Чаты</Link>
              <div className="user-menu dropdown">
                <button className="dropdown-btn">
                  {userData.firstName} {userData.lastName}
                </button>
                <div className="dropdown-content">
                  <Link to={`/profile/${userData.id}`} className="dropdown-link">
                    Профиль
                  </Link>
                  <button onClick={handleLogout} className="dropdown-link logout-btn">
                    Выйти
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Войти</Link>
              <Link to="/register" className="nav-link register-btn">
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
