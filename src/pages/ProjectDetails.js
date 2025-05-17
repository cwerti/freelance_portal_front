import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ProjectCard from '../components/ProjectCard';
import '../styles/ProjectDetails.css';

const ProjectDetails = () => {
  const [project, setProject] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editOrderError, setEditOrderError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchProject(token);
  }, [id, navigate]);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const fetchProject = async (token) => {
    try {
      const response = await fetch(`http://localhost:8000/orders/by-order/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data);
        
        // Проверяем, является ли текущий пользователь владельцем
        const decodedToken = jwtDecode(token);
        console.log('Token data:', decodedToken);
        console.log('Project author_id:', data.author_id);
        
        // Проверяем оба возможных поля для ID пользователя
        const tokenUserId = decodedToken.id || decodedToken.sub;
        console.log('Token user ID:', tokenUserId);
        
        const isOwnerResult = tokenUserId && data.author_id && 
          (tokenUserId.toString() === data.author_id.toString());
        console.log('Is owner:', isOwnerResult);
        
        setIsOwner(isOwnerResult);

        // Если пользователь владелец, загружаем отклики
        if (isOwnerResult) {
          fetchResponses(token);
        }
      } else {
        if (response.status === 404) {
          setError('Проект не найден');
        } else {
          const errorText = await response.text();
          setError(`Не удалось загрузить проект: ${response.status} ${errorText}`);
        }
      }
    } catch (err) {
      setError(`Ошибка при загрузке проекта: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (token) => {
    try {
      const response = await fetch(`http://localhost:8000/responses/by-order/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setResponses(data);
      } else {
        console.error('Ошибка при загрузке откликов');
      }
    } catch (err) {
      console.error('Ошибка при загрузке откликов:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот проект?')) {
      return;
    }

    const token = getCookie('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      console.log('Deleting project:', id);
      const response = await fetch(`http://localhost:8000/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Project deleted successfully');
        navigate('/profile');
      } else {
        const errorText = await response.text();
        console.error('Error deleting project:', errorText);
        setError(`Не удалось удалить проект: ${errorText}`);
      }
    } catch (err) {
      console.error('Error in delete handler:', err);
      setError(`Ошибка при удалении проекта: ${err.message}`);
    }
  };

  const handleAcceptResponse = async (responseId) => {
    const token = getCookie('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/responses/accept/${responseId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      if (response.ok) {
        // Обновляем проект и отклики после принятия
        fetchProject(token);
        fetchResponses(token);
      } else {
        const errorText = await response.text();
        setError(`Не удалось принять отклик: ${errorText}`);
      }
    } catch (err) {
      setError(`Ошибка при принятии отклика: ${err.message}`);
    }
  };

  const handleEditOrder = async (e) => {
    e.preventDefault();
    const token = getCookie('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Подготавливаем данные в формате, который ожидает бэкенд
      const updateData = {
        name: project.title,
        description: project.description,
        startPrice: parseInt(project.start_price),
        categoryId: parseInt(project.category_id),
        statusId: parseInt(project.status_id)
      };

      const response = await fetch(`http://localhost:8000/orders/update?order_id=${project.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        setEditOrderError(`Ошибка при обновлении заказа: ${errorData}`);
        return;
      }

      setShowEditForm(false);
      // Перезагружаем данные проекта
      fetchProject(token);
    } catch (err) {
      setEditOrderError(`Ошибка: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-container">
          <div className="loading">Загрузка проекта...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="error-container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="main-content">
        <div className="error-container">
          <div className="error">Проект не найден</div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="project-details-container">
        <ProjectCard
          project={project}
          isOwner={isOwner}
          onDelete={handleDelete}
        />
        
        {showEditForm && isOwner && (
          <div className="edit-form-overlay">
            <div className="edit-form">
              <h3>Редактирование заказа</h3>
              {editOrderError && (
                <div className="error-message">{editOrderError}</div>
              )}
              <form onSubmit={handleEditOrder}>
                <div className="form-group">
                  <label>Название</label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => setProject({
                      ...project,
                      title: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Описание</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => setProject({
                      ...project,
                      description: e.target.value
                    })}
                    required
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Стартовая цена (₽)</label>
                  <input
                    type="number"
                    value={project.start_price}
                    onChange={(e) => setProject({
                      ...project,
                      start_price: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Статус</label>
                  <select
                    value={project.status_id}
                    onChange={(e) => setProject({
                      ...project,
                      status_id: parseInt(e.target.value)
                    })}
                    required
                  >
                    <option value="1">Активный</option>
                    <option value="2">В работе</option>
                    <option value="3">Завершен</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Категория</label>
                  <select
                    value={project.category_id}
                    onChange={(e) => setProject({
                      ...project,
                      category_id: parseInt(e.target.value)
                    })}
                    required
                  >
                    <option value="1">Разработка</option>
                    <option value="2">Дизайн</option>
                    <option value="3">Маркетинг</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    Сохранить изменения
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditOrderError('');
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {isOwner && responses.length > 0 && (
          <div className="responses-section">
            <h2>Отклики на проект</h2>
            <div className="responses-list">
              {responses.map((response) => (
                <div key={response.id} className="response-card">
                  <div className="response-header">
                    <span className="response-author">{response.author_name}</span>
                    <span className="response-price">{response.price} ₽</span>
                  </div>
                  <p className="response-comment">{response.comment}</p>
                  <div className="response-meta">
                    <span className="response-date">
                      {new Date(response.created_at).toLocaleDateString('ru-RU')}
                    </span>
                    {project.status === 1 && (
                      <button
                        onClick={() => handleAcceptResponse(response.id)}
                        className="accept-response-btn"
                      >
                        Принять отклик
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;