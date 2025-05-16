import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';
import { jwtDecode } from 'jwt-decode';
import '../styles/ProjectCard.css';

const ProjectCard = ({ project, isOwner, onDelete }) => {
  const navigate = useNavigate();
  
  console.log('ProjectCard rendered with props:', {
    projectId: project?.id,
    isOwner: isOwner,
    authorId: project?.author_id
  });

  const [responseError, setResponseError] = useState('');
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [showBidsModal, setShowBidsModal] = useState(false);
  const [bids, setBids] = useState([]);
  const [bidsError, setBidsError] = useState('');
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
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const token = parts.pop().split(';').shift();
        console.log('Found token in cookies:', token ? 'Yes' : 'No');
        return token;
      }
      console.log('Token not found in cookies');
      return null;
    } catch (err) {
      console.error('Error reading cookie:', err);
      return null;
    }
  };

  const validateToken = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      console.log('Token contents:', decodedToken);
      
      // Проверяем срок действия токена
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.error('Token has expired');
        return null;
      }

      // Проверяем наличие ID пользователя (может быть в поле sub или id)
      const userId = parseInt(decodedToken.id || decodedToken.sub);
      console.log('Extracted user ID:', userId);

      if (isNaN(userId)) {
        console.error('Invalid user ID in token');
        return null;
      }

      return userId;
    } catch (err) {
      console.error('Error validating token:', err);
      return null;
    }
  };

  const handleResponse = async (e) => {
    e.preventDefault();
    const token = getCookie('access_token');
    
    if (!token) {
      setResponseError('Пожалуйста, войдите в систему');
      navigate('/login');
      return;
    }

    try {
      // Получаем ID пользователя из токена
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      if (!userId) {
        setResponseError('Ошибка авторизации. Не удалось получить ID пользователя');
        return;
      }

      if (!responseData.price || !responseData.comment) {
        setResponseError('Пожалуйста, заполните все поля');
        return;
      }

      // Формируем данные точно как в примере
      const bidData = {
        userId: userId,
        price: parseFloat(responseData.price),
        comment: responseData.comment.trim()
      };

      console.log('Отправляемые данные:', bidData);

      const response = await fetch(`http://localhost:8000/bids/orders/${project.id}/bids`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(bidData)
      });

      let responseText;
      try {
        responseText = await response.text();
        console.log('Полный ответ сервера:', responseText);
        
        if (!response.ok) {
          const apiResponse = responseText ? JSON.parse(responseText) : {};
          if (apiResponse.detail) {
            const errorMessage = Array.isArray(apiResponse.detail) 
              ? apiResponse.detail[0].msg 
              : apiResponse.detail;
            setResponseError(`Ошибка: ${errorMessage}`);
          } else {
            setResponseError('Произошла ошибка при отправке отклика');
          }
          return;
        }

        // Если ответ успешный
        setShowResponseForm(false);
        setResponseData({ price: '', comment: '' });
        window.location.reload();
      } catch (parseError) {
        console.error('Ошибка при обработке ответа:', parseError);
        setResponseError(`Ошибка при обработке ответа сервера: ${responseText}`);
      }
    } catch (err) {
      console.error('Error submitting bid:', err);
      setResponseError(`Ошибка: ${err.message}`);
    }
  };

  const handleStatusChange = async (newStatus, bidId = null) => {
    const token = getCookie('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      let url = bidId 
        ? `http://localhost:8000/bids/bids/${bidId}/accept`
        : `http://localhost:8000/orders/update?order_id=${project.id}`;

      let body = bidId 
        ? {}
        : {
            name: project.name || project.title,
            description: project.description,
            startPrice: parseInt(project.start_price),
            categoryId: parseInt(project.category_id),
            statusId: parseInt(newStatus)
          };

      const response = await fetch(url, {
        method: bidId ? 'PATCH' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.text();
        setStatusUpdateError(`Ошибка при обновлении статуса: ${errorData}`);
        return;
      }

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

  // Функция для загрузки откликов
  const fetchBids = async () => {
    const token = getCookie('access_token');
    if (!token) {
      setBidsError('Необходима авторизация');
      return;
    }

    try {
      console.log('Fetching bids for project:', project.id);
      const response = await fetch(`http://localhost:8000/bids/orders/${project.id}/bids`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const responseText = await response.text();
      console.log('Response from server:', responseText);

      if (!response.ok) {
        setBidsError('Ошибка при загрузке откликов');
        return;
      }

      const bidsData = responseText ? JSON.parse(responseText) : [];
      console.log('Received bids:', bidsData);
      setBids(bidsData);
      setShowBidsModal(true);
    } catch (err) {
      console.error('Ошибка при загрузке откликов:', err);
      setBidsError('Ошибка при загрузке откликов');
    }
  };

  const handleAcceptBid = async (bidId) => {
    const token = getCookie('access_token');
    if (!token) {
      setBidsError('Необходима авторизация');
      return;
    }

    try {
      // Принимаем отклик
      const acceptResponse = await fetch(`http://localhost:8000/bids/bids/${bidId}/accept`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!acceptResponse.ok) {
        const errorText = await acceptResponse.text();
        setBidsError(`Ошибка при принятии отклика: ${errorText}`);
        return;
      }

      // Обновляем статус проекта на "В работе"
      const updateStatusResponse = await fetch(`http://localhost:8000/orders/update?order_id=${project.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: project.name || project.title,
          description: project.description,
          startPrice: parseInt(project.start_price),
          categoryId: parseInt(project.category_id),
          statusId: 2 // Статус "В работе"
        })
      });

      if (!updateStatusResponse.ok) {
        const errorText = await updateStatusResponse.text();
        setBidsError(`Ошибка при обновлении статуса проекта: ${errorText}`);
        return;
      }

      await fetchBids(); // Обновляем список откликов
      window.location.reload(); // Перезагружаем страницу для обновления статуса
    } catch (err) {
      console.error('Ошибка при принятии отклика:', err);
      setBidsError('Ошибка при принятии отклика');
    }
  };

  const handleRejectBid = async (bidId) => {
    const token = getCookie('access_token');
    if (!token) {
      setBidsError('Необходима авторизация');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/bids/bids/${bidId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        setBidsError(`Ошибка при отклонении отклика: ${errorText}`);
        return;
      }

      await fetchBids(); // Обновляем список откликов
    } catch (err) {
      console.error('Ошибка при отклонении отклика:', err);
      setBidsError('Ошибка при отклонении отклика');
    }
  };

  const getBidStatusText = (status) => {
    const statuses = {
      1: 'На рассмотрении',
      2: 'Принят',
      3: 'Отклонен'
    };
    return statuses[status] || 'Неизвестный статус';
  };

  // Компонент модального окна с откликами
  const BidsModal = () => {
    if (!showBidsModal) return null;

    return (
      <div className="bids-modal-overlay">
        <div className="bids-modal">
          <div className="bids-modal-header">
            <h2>Отклики на проект</h2>
            <button className="close-button" onClick={() => setShowBidsModal(false)}>×</button>
          </div>
          {bidsError && <div className="error-message">{bidsError}</div>}
          <div className="bids-list">
            {bids.length === 0 ? (
              <p className="no-bids">На данный проект пока нет откликов</p>
            ) : (
              bids.map((bid) => (
                <div key={bid.id} className="bid-item">
                  <div className="bid-header">
                    <span className="bid-author">Фрилансер ID: {bid.userId}</span>
                    <span className="bid-price">{formatPrice(bid.price)} ₽</span>
                  </div>
                  <p className="bid-comment">{bid.comment}</p>
                  <div className="bid-info">
                    <div className="bid-date">
                      Отправлено: {bid.createdAt ? new Date(bid.createdAt).toLocaleString('ru-RU') : 'Дата не указана'}
                    </div>
                    <div className="bid-status">
                      Статус: {getBidStatusText(bid.status)}
                    </div>
                  </div>
                  {project.status_id === 1 && bid.status === 1 && (
                    <div className="bid-actions">
                      <button 
                        onClick={() => handleAcceptBid(bid.id)}
                        className="accept-bid-button"
                      >
                        Принять отклик
                      </button>
                      <button 
                        onClick={() => handleRejectBid(bid.id)}
                        className="reject-bid-button"
                      >
                        Отклонить
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
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
            <div className="status-description">{statusInfo.description}</div>
          </div>
          <span className="category">{project.category}</span>
          <div className="price-info">
            <span className="price">
              Максимальная цена: {formatPrice(project.start_price)} ₽
            </span>
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
            <button onClick={fetchBids} className="view-bids-button">
              Посмотреть отклики
            </button>
            <div className="status-control">
              <select
                value={project.status_id}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="status-select"
              >
                <option value="1">Активный</option>
                <option value="2">В работе</option>
                <option value="3">Завершен</option>
              </select>
              {statusUpdateError && (
                <div className="error-message">{statusUpdateError}</div>
              )}
            </div>
            <button onClick={() => setShowEditForm(true)} className="edit-btn">
              Изменить заказ
            </button>
            {/* <button onClick={onDelete} className="delete-btn">
              Удалить проект
            </button> */}
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
                    <label>Предложите свою цену (₽)</label>
                    <input
                      type="number"
                      value={responseData.price}
                      onChange={(e) => setResponseData({
                        ...responseData,
                        price: e.target.value
                      })}
                      required
                      min={project.start_price || 0}
                      placeholder="Укажите вашу цену"
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

      {/* Добавляем модальное окно с откликами */}
      <BidsModal />
    </div>
  );
};

export default ProjectCard;
