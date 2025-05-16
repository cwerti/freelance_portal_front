import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';
import '../styles/ProjectCard.css';

const ProjectCard = ({ project, isOwner, onDelete }) => {
  const navigate = useNavigate();
  const [responseError, setResponseError] = useState('');
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [editOrderError, setEditOrderError] = useState('');
  const [responseData, setResponseData] = useState({
    price: '',
    comment: '',
  });
  const [orderData, setOrderData] = useState({
    title: project.title,
    description: project.description,
    start_price: project.start_price,
    expected_price: project.expected_price,
    deadline: project.deadline,
    requirements: project.requirements,
    category: project.category
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status_id) => {
    const statuses = {
      1: {
        text: 'Активный',
        description: 'Проект открыт для откликов',
        class: 'status-active',
        icon: '🟢'
      },
      2: {
        text: 'В работе',
        description: 'Исполнитель выбран',
        class: 'status-in-progress',
        icon: '🔄'
      },
      3: {
        text: 'Завершен',
        description: 'Проект закрыт',
        class: 'status-completed',
        icon: '✅'
      },
    };
    return statuses[status_id] || {
      text: 'Неизвестный статус',
      description: 'Статус проекта не определен',
      class: 'status-unknown',
      icon: '❓'
    };
  };

  const handleEdit = () => {
    navigate(`/edit-project/${project.id}`);
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const handleResponse = async (e) => {
    e.preventDefault();
    const token = getCookie('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/responses/create/${project.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(responseData)
      });

      if (response.ok) {
        setShowResponseForm(false);
        setResponseData({ price: '', comment: '' });
      } else {
        const errorData = await response.text();
        setResponseError(`Ошибка при отправке отклика: ${errorData}`);
      }
    } catch (err) {
      setResponseError(`Ошибка: ${err.message}`);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const token = getCookie('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/projects/${project.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status_id: parseInt(newStatus) })
      });

      if (!response.ok) {
        const errorData = await response.text();
        setStatusUpdateError(`Ошибка при обновлении статуса: ${errorData}`);
        return;
      }

      // Refresh the page or update the project state
      window.location.reload();
    } catch (err) {
      setStatusUpdateError(`Ошибка: ${err.message}`);
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
      const response = await fetch(`http://localhost:8000/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        setEditOrderError(`Ошибка при обновлении заказа: ${errorData}`);
        return;
      }

      setShowEditForm(false);
      window.location.reload();
    } catch (err) {
      setEditOrderError(`Ошибка: ${err.message}`);
    }
  };

  const statusInfo = getStatusInfo(project.status_id);

  return (
    <div className="project-card">
      <div className="project-header">
        <h1>{project.title}</h1>
        <div className="project-meta">
          <div className="status-section">
            <div className={`status ${statusInfo.class}`}>
              <span className="status-icon">{statusInfo.icon}</span>
              <span className="status-text">{statusInfo.text}</span>
            </div>
            <span className="status-description">{statusInfo.description}</span>
          </div>
          <span className="category">{project.category}</span>
          <div className="price-info">
            <span className="price">
              Стартовая цена: {formatPrice(project.start_price)} ₽
            </span>
            {project.expected_price && (
              <span className="price expected">
                Ожидаемая цена: {formatPrice(project.expected_price)} ₽
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="project-info">
        <div className="info-section">
          <h2>Описание проекта</h2>
          <p>{project.description}</p>
        </div>

        <div className="info-section">
          <h3>Детали проекта</h3>
          <ul>
            {project.deadline && (
              <li>
                <strong>Дедлайн:</strong> {formatDate(project.deadline)}
              </li>
            )}
            <li>
              <strong>Категория:</strong> {project.category}
            </li>
            <li>
              <strong>Дата создания:</strong> {formatDate(project.created_at)}
            </li>
            {project.updated_at && (
              <li>
                <strong>Последнее обновление:</strong> {formatDate(project.updated_at)}
              </li>
            )}
          </ul>
        </div>

        {project.requirements && (
          <div className="info-section">
            <h3>Требования</h3>
            <p>{project.requirements}</p>
          </div>
        )}

        {isOwner ? (
          <div className="author-controls">
            <div className="status-control">
              <select
                value={project.status_id}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="status-select"
              >
                <option value="1">Активный</option>
                <option value="2">В работе</option>
                <option value="3">Завершен</option>
                <option value="4">Отменен</option>
              </select>
              {statusUpdateError && (
                <div className="error-message">{statusUpdateError}</div>
              )}
            </div>
            <button onClick={() => setShowEditForm(true)} className="edit-btn">
              Изменить заказ
            </button>
            <button onClick={onDelete} className="delete-btn">
              Удалить проект
            </button>
          </div>
        ) : project.status_id === 1 && (
          <div className="response-section">
            {!showResponseForm ? (
              <button 
                onClick={() => setShowResponseForm(true)} 
                className="respond-button"
              >
                Откликнуться на проект
              </button>
            ) : (
              <div className="response-form">
                <h3>Отклик на проект</h3>
                {responseError && (
                  <div className="error-message">{responseError}</div>
                )}
                <form onSubmit={handleResponse}>
                  <div className="form-group">
                    <label>Предлагаемая цена (₽)</label>
                    <input
                      type="number"
                      value={responseData.price}
                      onChange={(e) => setResponseData({
                        ...responseData,
                        price: e.target.value
                      })}
                      required
                      min={project.start_price || 0}
                      placeholder={`Минимум ${formatPrice(project.start_price)} ₽`}
                    />
                  </div>
                  <div className="form-group">
                    <label>Комментарий</label>
                    <textarea
                      value={responseData.comment}
                      onChange={(e) => setResponseData({
                        ...responseData,
                        comment: e.target.value
                      })}
                      required
                      rows="4"
                      placeholder="Опишите ваше предложение..."
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-button">
                      Отправить отклик
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => {
                        setShowResponseForm(false);
                        setResponseError('');
                      }}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

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
                    value={orderData.title}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      title: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Описание</label>
                  <textarea
                    value={orderData.description}
                    onChange={(e) => setOrderData({
                      ...orderData,
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
                    value={orderData.start_price}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      start_price: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ожидаемая цена (₽)</label>
                  <input
                    type="number"
                    value={orderData.expected_price}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      expected_price: e.target.value
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Дедлайн</label>
                  <input
                    type="datetime-local"
                    value={orderData.deadline ? new Date(orderData.deadline).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      deadline: e.target.value
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Требования</label>
                  <textarea
                    value={orderData.requirements}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      requirements: e.target.value
                    })}
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Категория</label>
                  <input
                    type="text"
                    value={orderData.category}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      category: e.target.value
                    })}
                    required
                  />
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
      </div>
    </div>
  );
};

export default ProjectCard;
