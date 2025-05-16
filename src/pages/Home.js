import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import "../styles/Home.css";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie('access_token');
    setIsAuthenticated(!!token);
    if (token) {
      fetchCategories(token);
      fetchRecentProjects(token);
    } else {
      setLoading(false);
    }
  }, []);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

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
      } else {
        setError('Не удалось загрузить категории');
      }
    } catch (err) {
      setError('Ошибка при загрузке категорий');
    }
  };

  const fetchRecentProjects = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/orders/recent', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setRecentProjects(data.slice(0, 6));
      }
    } catch (err) {
      console.error('Ошибка при загрузке последних проектов:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Найдите лучших фрилансеров для вашего проекта</h1>
          <p>Выберите категорию и начните работу с профессионалами прямо сейчас</p>
        </div>
      </section>

      <section className="categories-section">
        <h2>Категории проектов</h2>
        <div className="categories-grid">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/category/${category.name}`}
              className="category-card"
            >
              <div className="category-icon">
                {category.image ? (
                  <img 
                    src={`http://localhost:8000/uploads/${category.image}`} 
                    alt={category.name}
                    className="category-image"
                  />
                ) : (
                  category.name.charAt(0)
                )}
              </div>
              <h3>{category.name}</h3>
              <p className="category-description">
                {category.description || `Проекты в категории ${category.name}`}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {recentProjects.length > 0 && (
        <section className="recent-projects">
          <h2>Последние проекты</h2>
          <div className="projects-grid">
            {recentProjects.map(project => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                {project.image && (
                  <div className="project-image">
                    <img 
                      src={`http://localhost:8000/uploads/${project.image}`} 
                      alt={project.name}
                    />
                  </div>
                )}
                <h3>{project.name}</h3>
                <p>{project.description.substring(0, 100)}...</p>
                <div className="project-meta">
                  <span className="price">{project.start_price} ₽</span>
                  <span className="date">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="cta-section">
        <div className="cta-content">
          <h2>Готовы начать?</h2>
          <p>
            {isAuthenticated 
              ? "Создайте свой проект прямо сейчас"
              : "Создайте свой проект или найдите подходящий заказ прямо сейчас"
            }
          </p>
          <div className="cta-buttons">
            <Link to="/create-project" className="cta-button primary">
              Создать проект
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="cta-button secondary">
                Зарегистрироваться
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
