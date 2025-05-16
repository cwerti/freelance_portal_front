import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { formatPrice } from '../utils/formatters';
import '../styles/CategoryPage.css';

const CategoryPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [categories, setCategories] = useState({});
  const [currentCategory, setCurrentCategory] = useState(null);
  const { categoryName } = useParams();
  const navigate = useNavigate();

  const statusNames = {
    1: "Активный",
    2: "В работе",
    3: "Завершен",
    4: "Отменен"
  };

  useEffect(() => {
    const token = getCookie('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    console.log('Initial categoryName:', categoryName);
    // Загружаем категории при монтировании компонента
    fetchCategories(token);
  }, [navigate]);

  useEffect(() => {
    const token = getCookie('access_token');
    console.log('Effect triggered. Token:', !!token, 'CurrentCategory:', currentCategory);
    
    if (!token || !currentCategory) {
      return;
    }

    fetchProjects(token);
  }, [categoryName, sortBy, priceRange, currentCategory]);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const fetchCategories = async (token) => {
    try {
      console.log('Fetching categories with token:', !!token);

      // Using the correct /orders/categories endpoint
      const response = await fetch('http://localhost:8000/orders/categories', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      console.log('Categories response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Received categories:', data);
        
        const categoriesMap = {};
        data.forEach(category => {
          categoriesMap[category.name] = category;
          console.log(`Mapping category: ${category.name} -> ID: ${category.id}`);
        });
        setCategories(categoriesMap);
        
        if (categoryName && categoriesMap[categoryName]) {
          console.log(`Found matching category for ${categoryName}:`, categoriesMap[categoryName]);
          setCurrentCategory(categoriesMap[categoryName]);
        } else {
          console.log('Category not found in map:', categoryName);
          console.log('Available categories:', Object.keys(categoriesMap));
          if (data.length > 0) {
            console.log('First available category:', data[0]);
          }
        }
      } else {
        const errorText = await response.text();
        console.error('Categories error response:', errorText);
        setError(`Не удалось загрузить категории: ${response.status} ${errorText}`);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(`Ошибка при загрузке категорий: ${err.message}`);
    }
  };

  const fetchProjects = async (token) => {
    try {
      if (!currentCategory) {
        setError('Неверная категория');
        return;
      }

      console.log('Fetching projects for category:', currentCategory);
      console.log('Category ID:', currentCategory.id);

      // Using the /orders/orders endpoint and filtering by category
      const response = await fetch('http://localhost:8000/orders/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        let data = await response.json();
        console.log('Received all projects:', data);
        
        // Filter projects by category and active status
        data = data.filter(project => 
          project.category_id === currentCategory.id && 
          project.status_id === 1
        );
        console.log('Filtered active projects for category:', data);

        // Фильтрация по цене
        if (priceRange.min || priceRange.max) {
          data = data.filter(project => {
            const price = project.start_price;
            const meetsMinPrice = !priceRange.min || price >= parseInt(priceRange.min);
            const meetsMaxPrice = !priceRange.max || price <= parseInt(priceRange.max);
            return meetsMinPrice && meetsMaxPrice;
          });
        }

        // Сортировка
        data.sort((a, b) => {
          switch (sortBy) {
            case 'newest':
              return new Date(b.created_at) - new Date(a.created_at);
            case 'oldest':
              return new Date(a.created_at) - new Date(b.created_at);
            case 'priceHigh':
              return b.start_price - a.start_price;
            case 'priceLow':
              return a.start_price - b.start_price;
            default:
              return 0;
          }
        });

        setProjects(data);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setError(`Не удалось загрузить проекты: ${response.status} ${errorText}`);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(`Ошибка при загрузке проектов: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading && !currentCategory) {
    return <div className="loading">Загрузка категории...</div>;
  }
  
  if (!currentCategory) {
    return <div className="error">Категория не найдена</div>;
  }

  if (loading) return <div className="loading">Загрузка проектов...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>{categoryName}</h1>
        <p>Найдено проектов: {projects.length}</p>
      </div>

      <div className="filters-section">
        <div className="sort-filter">
          <label>Сортировать по:</label>
          <select value={sortBy} onChange={handleSortChange}>
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="priceHigh">По убыванию цены</option>
            <option value="priceLow">По возрастанию цены</option>
          </select>
        </div>

        <div className="price-filter">
          <label>Цена:</label>
          <input
            type="number"
            name="min"
            placeholder="От"
            value={priceRange.min}
            onChange={handlePriceRangeChange}
          />
          <input
            type="number"
            name="max"
            placeholder="До"
            value={priceRange.max}
            onChange={handlePriceRangeChange}
          />
        </div>
      </div>

      <div className="projects-grid">
        {projects.length > 0 ? (
          projects.map(project => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className="project-card-header">
                <h3>{project.name}</h3>
                <span className={`status status-${project.status_id}`}>
                  {statusNames[project.status_id]}
                </span>
              </div>
              
              <p className="project-description">
                {project.description.length > 150
                  ? `${project.description.substring(0, 150)}...`
                  : project.description}
              </p>

              <div className="project-meta">
                <span className="price">{formatPrice(project.start_price)} ₽</span>
                <span className="date">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-projects">
            <p>В данной категории пока нет проектов</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;