import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';
import { jwtDecode } from 'jwt-decode';
import '../styles/ProjectCard.css';

// Добавляем стили для анимации загрузки
const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

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
    name: project.title || project.name,
    description: project.description,
    startPrice: project.start_price,
    categoryId: project.category_id || 1,
    statusId: project.status_id
  });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isLoadingBids, setIsLoadingBids] = useState(false);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  // Загрузка категорий при монтировании компонента
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        console.log('Загрузка категорий...');
        const response = await fetch('http://localhost:8000/orders/categories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Загруженные категории:', data);
          setCategories(data);
        } else {
          console.error('Ошибка при загрузке категорий:', response.status);
        }
      } catch (err) {
        console.error('Ошибка при загрузке категорий:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

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
      setIsSubmittingBid(true);
      setResponseError('');

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

      // Проверяем ID проекта
      if (!project.id) {
        setResponseError('Ошибка: ID проекта не найден');
        return;
      }

      // Формируем данные для отправки
      const bidData = {
        userId: parseInt(userId),
        price: parseFloat(responseData.price),
        comment: responseData.comment.trim()
      };

      console.log('Отправляемые данные отклика:', bidData);
      console.log('URL для отправки:', `http://localhost:8000/bids/orders/${project.id}/bids`);

      // Сначала выполняем preflight запрос для проверки CORS
      const preflightResponse = await fetch(`http://localhost:8000/bids/orders/${project.id}/bids`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Authorization, Content-Type'
        }
      }).catch(err => {
        console.log('Preflight request failed:', err);
        // Продолжаем даже если preflight не удался
        return { ok: false };
      });

      const response = await fetch(`http://localhost:8000/bids/orders/${project.id}/bids`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify(bidData)
      });

      console.log('Статус ответа:', response.status);
      
      // Получаем текст ответа даже если ответ не успешный
      const responseText = await response.text();
      console.log('Полный ответ сервера:', responseText);
      
      if (!response.ok) {
        try {
          // Пробуем распарсить JSON, если возможно
          const apiResponse = responseText ? JSON.parse(responseText) : {};
          
          if (apiResponse.detail) {
            const errorMessage = Array.isArray(apiResponse.detail) 
              ? apiResponse.detail[0].msg 
              : apiResponse.detail;
            setResponseError(`Ошибка: ${errorMessage}`);
          } else {
            setResponseError(`Ошибка при отправке отклика: ${response.status}`);
          }
        } catch (parseError) {
          // Если не удалось распарсить JSON, показываем текст как есть
          setResponseError(`Ошибка: ${responseText || response.statusText}`);
        }
        return;
      }

      // Если ответ успешный
      setShowResponseForm(false);
      setResponseData({ price: '', comment: '' });
      
      // Показываем сообщение об успехе перед перезагрузкой
      alert('Отклик успешно отправлен!');
      window.location.reload();
    } catch (err) {
      console.error('Ошибка при отправке отклика:', err);
      setResponseError(`Ошибка при отправке: ${err.message}`);
    } finally {
      setIsSubmittingBid(false);
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
      // Валидация данных
      if (!orderData.name || !orderData.description || !orderData.startPrice) {
        setEditOrderError('Пожалуйста, заполните все обязательные поля');
        return;
      }

      // Используем изначальную категорию проекта
      const body = {
        name: orderData.name,
        description: orderData.description,
        startPrice: parseInt(orderData.startPrice),
        categoryId: parseInt(project.category_id), // Всегда используем исходную категорию
        statusId: parseInt(orderData.statusId)
      };

      console.log('Отправка данных для обновления проекта:', body);

      const response = await fetch(`http://localhost:8000/orders/update?order_id=${project.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify(body)
      });

      const responseText = await response.text();
      console.log('Ответ сервера:', responseText);

      if (!response.ok) {
        setEditOrderError(`Ошибка при обновлении заказа: ${responseText}`);
        return;
      }

      setShowEditForm(false);
      window.location.reload();
    } catch (err) {
      console.error('Ошибка при обновлении заказа:', err);
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
      setIsLoadingBids(true);
      setBidsError('');
      
      if (!project.id) {
        console.error('ID проекта отсутствует');
        setBidsError('Невозможно загрузить отклики: ID проекта не найден');
        return;
      }

      console.log('Загрузка откликов для проекта:', project.id);
      
      const response = await fetch(`http://localhost:8000/bids/orders/${project.id}/bids`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
      });

      console.log('Статус ответа:', response.status);
      const responseText = await response.text();
      console.log('Ответ сервера:', responseText);

      if (!response.ok) {
        if (response.status === 404) {
          // Если проект новый и откликов нет - показываем пустой список
          console.log('Отклики не найдены (новый проект)');
          setBids([]);
          setShowBidsModal(true);
          return;
        }
        
        setBidsError(`Ошибка при загрузке откликов: ${response.status}`);
        return;
      }

      try {
        const bidsData = responseText ? JSON.parse(responseText) : [];
        console.log('Полученные отклики:', bidsData);
        setBids(Array.isArray(bidsData) ? bidsData : []);
      } catch (parseError) {
        console.error('Ошибка при разборе JSON:', parseError);
        setBids([]);
      }
      
      setShowBidsModal(true);
    } catch (err) {
      console.error('Ошибка при загрузке откликов:', err);
      setBidsError(`Ошибка при загрузке откликов: ${err.message}`);
      // При ошибке все равно покажем модальное окно с сообщением
      setBids([]);
      setShowBidsModal(true);
    } finally {
      setIsLoadingBids(false);
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
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        }
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
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
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
      setBidsError(`Ошибка при принятии отклика: ${err.message}`);
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
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        setBidsError(`Ошибка при отклонении отклика: ${errorText}`);
        return;
      }

      await fetchBids(); // Обновляем список откликов
    } catch (err) {
      console.error('Ошибка при отклонении отклика:', err);
      setBidsError(`Ошибка при отклонении отклика: ${err.message}`);
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

  // Обновленное модальное окно с откликами
  const BidsModal = () => {
    if (!showBidsModal) return null;

    const modalStyles = {
      overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      },
      modal: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      },
      header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        borderBottom: '1px solid #eee',
        backgroundColor: '#f8f8f8'
      },
      closeButton: {
        border: 'none',
        background: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#777'
      },
      content: {
        padding: '20px',
        overflowY: 'auto',
        flex: 1
      },
      errorMessage: {
        padding: '10px 15px',
        margin: '0 20px 15px',
        backgroundColor: '#ffebee',
        color: '#c62828',
        borderRadius: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      },
      retryButton: {
        padding: '5px 10px',
        backgroundColor: '#e0e0e0',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginLeft: '10px'
      },
      noBids: {
        textAlign: 'center',
        padding: '30px 20px',
        color: '#757575'
      },
      infoText: {
        textAlign: 'center',
        color: '#757575',
        fontSize: '14px',
        marginTop: '10px'
      },
      refreshButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 15px',
        backgroundColor: '#f0f0f0',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        color: '#333',
        fontSize: '14px',
        marginBottom: '15px',
        transition: 'background-color 0.3s'
      },
      refreshIcon: {
        marginRight: '5px',
        fontSize: '16px'
      },
      loadingSpinner: {
        display: 'inline-block',
        width: '16px',
        height: '16px',
        border: '2px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '50%',
        borderTopColor: '#333',
        animation: 'spin 1s ease-in-out infinite',
        marginRight: '8px'
      },
      headerActions: {
        display: 'flex',
        alignItems: 'center'
      }
    };

    return (
      <>
        {/* Добавляем стили анимации */}
        <style>{spinKeyframes}</style>
        
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={modalStyles.header}>
              <h2>Отклики на проект</h2>
              <div style={modalStyles.headerActions}>
                <button 
                  onClick={fetchBids} 
                  style={{...modalStyles.refreshButton, marginRight: '10px'}}
                  disabled={isLoadingBids}
                >
                  {isLoadingBids ? (
                    <>
                      <span style={modalStyles.loadingSpinner}></span>
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <span style={modalStyles.refreshIcon}>↻</span>
                      Обновить
                    </>
                  )}
                </button>
                <button style={modalStyles.closeButton} onClick={() => setShowBidsModal(false)}>×</button>
              </div>
            </div>
            
            <div style={modalStyles.content}>
              {bidsError && (
                <div style={modalStyles.errorMessage}>
                  {bidsError}
                  <button 
                    onClick={() => fetchBids()}
                    style={modalStyles.retryButton}
                    disabled={isLoadingBids}
                  >
                    {isLoadingBids ? 'Загрузка...' : 'Повторить'}
                  </button>
                </div>
              )}
              
              {isLoadingBids && !bidsError && (
                <div style={{textAlign: 'center', padding: '20px'}}>
                  <div style={{...modalStyles.loadingSpinner, width: '30px', height: '30px', margin: '0 auto 15px'}}></div>
                  <p>Загрузка откликов...</p>
                </div>
              )}
              
              {!isLoadingBids && (!bids || bids.length === 0) && !bidsError && (
                <div style={modalStyles.noBids}>
                  <p className="no-bids">На данный проект пока нет откликов</p>
                  {project.status_id === 1 && isOwner && (
                    <p style={modalStyles.infoText}>
                      Когда фрилансеры откликнутся на ваш проект, вы увидите их предложения здесь.
                    </p>
                  )}
                </div>
              )}
              
              {!isLoadingBids && bids && bids.length > 0 && (
                <div className="bids-list">
                  {bids.map((bid) => (
                    <div key={bid.id || `bid-${Math.random()}`} className="bid-item">
                      <div className="bid-header">
                        <span className="bid-author">Фрилансер ID: {bid.userId || 'Не указан'}</span>
                        <span className="bid-price">{formatPrice(bid.price || 0)} ₽</span>
                      </div>
                      <p className="bid-comment">{bid.comment || 'Комментарий отсутствует'}</p>
                      <div className="bid-info">
                        <div className="bid-date">
                          Отправлено: {bid.createdAt ? new Date(bid.createdAt).toLocaleString('ru-RU') : 'Дата не указана'}
                        </div>
                        <div className="bid-status">
                          Статус: {getBidStatusText(bid.status)}
                        </div>
                      </div>
                      {project.status_id === 1 && bid.status === 1 && isOwner && (
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
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  const statusInfo = getStatusInfo(project.status_id);

  // Добавляем новую функцию для получения названия категории по ID
  const getCategoryNameById = (categoryId) => {
    const category = categories.find(cat => cat.id === parseInt(categoryId));
    return category ? category.name : 'Категория не указана';
  };

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
              <strong>Категория:</strong> {categories.length > 0 && project.category_id 
                ? getCategoryNameById(project.category_id) 
                : (project.category || 'Загрузка...')}
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
                    value={orderData.name}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      name: e.target.value
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
                    value={orderData.startPrice}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      startPrice: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Категория</label>
                  <div className="category-display" style={{
                    padding: '8px 12px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    color: '#555'
                  }}>
                    {getCategoryNameById(orderData.categoryId)}
                    <small style={{
                      display: 'block',
                      marginTop: '4px',
                      color: '#888',
                      fontSize: '12px'
                    }}>(категория не может быть изменена)</small>
                  </div>
                </div>
                <div className="form-group">
                  <label>Статус</label>
                  <select
                    value={orderData.statusId}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      statusId: parseInt(e.target.value)
                    })}
                    required
                  >
                    <option value="1">Активный</option>
                    <option value="2">В работе</option>
                    <option value="3">Завершен</option>
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
      </div>

      {/* Добавляем модальное окно с откликами */}
      <BidsModal />
    </div>
  );
};

export default ProjectCard;
