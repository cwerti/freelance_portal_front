import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/BidSystem.css';

const BidSystem = ({ projectId, projectOwnerId, currentUserId, projectStatus }) => {
  console.log('=== BidSystem Component Initialized ===');
  console.log('Props received:', {
    projectId,
    projectOwnerId,
    currentUserId,
    projectStatus
  });

  const [bids, setBids] = useState([]);
  const [newBid, setNewBid] = useState({ price: '', comment: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Определяем, является ли текущий пользователь владельцем проекта
  const isProjectOwner = currentUserId === projectOwnerId;
  console.log('Is project owner:', isProjectOwner);

  // Добавляем логирование при изменении формы
  const handlePriceChange = (e) => {
    console.log('Price changed:', e.target.value);
    setNewBid({ ...newBid, price: e.target.value });
  };

  const handleCommentChange = (e) => {
    console.log('Comment changed:', e.target.value);
    setNewBid({ ...newBid, comment: e.target.value });
  };

  // Fetch bids for the project
  const fetchBids = async () => {
    if (!projectOwnerId) return;

    try {
      setLoading(true);
      // Получаем все отклики для владельца проекта
      const response = await axios.get(`/bids/by-user/${projectOwnerId}`);
      setBids(response.data);
    } catch (err) {
      console.error('Error fetching bids:', err);
      setError('Не удалось загрузить отклики');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && projectOwnerId) {
      fetchBids();
    }
  }, [projectId, projectOwnerId]);

  // Handle bid submission
  const handleSubmitBid = async (e) => {
    e.preventDefault();
    console.log('=== Submit Bid Button Clicked ===');
    
    console.log('Form Data:', {
      currentUserId,
      projectId,
      price: newBid.price,
      comment: newBid.comment
    });
    
    if (!currentUserId) {
      const error = 'Пожалуйста, войдите в систему, чтобы оставить отклик';
      console.error(error);
      setError(error);
      return;
    }

    if (isProjectOwner) {
      const error = 'Вы не можете оставить отклик на свой собственный проект';
      console.error(error);
      setError(error);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Проверяем валидность данных перед отправкой
      if (!newBid.price || isNaN(parseFloat(newBid.price))) {
        const error = 'Пожалуйста, введите корректную цену';
        console.error(error);
        setError(error);
        return;
      }

      if (!newBid.comment || newBid.comment.trim() === '') {
        const error = 'Пожалуйста, добавьте комментарий к отклику';
        console.error(error);
        setError(error);
        return;
      }

      // Подготавливаем данные в соответствии со схемой бэкенда
      const bidData = {
        user_id: currentUserId,
        price: parseFloat(newBid.price),
        comment: newBid.comment.trim()
      };

      const url = `/bids/orders/${projectId}/bids`;
      console.log('=== Sending Bid Request ===');
      console.log('URL:', url);
      console.log('Request Data:', bidData);

      // Отправляем отклик
      const response = await axios.post(url, bidData);
      
      console.log('=== Server Response ===');
      console.log('Status:', response.status);
      console.log('Response Data:', response.data);

      setSuccess('Отклик успешно отправлен!');
      setNewBid({ price: '', comment: '' });
      fetchBids();
    } catch (err) {
      console.error('=== Bid Submission Error ===');
      console.error('Error object:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);

      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          const errorMessages = err.response.data.detail.map(e => {
            console.error('Validation error:', e);
            return `${e.loc.join('.')}: ${e.msg}`;
          });
          setError(errorMessages.join('\n'));
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError('Не удалось отправить отклик. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle bid acceptance
  const handleAcceptBid = async (bidId) => {
    if (!isProjectOwner) {
      setError('Только владелец проекта может принимать отклики');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.patch(`/bids/bids/${bidId}/accept`);
      setSuccess('Отклик успешно принят');
      fetchBids();
    } catch (err) {
      console.error('Ошибка при принятии отклика:', err);
      setError(err.response?.data?.detail || 'Не удалось принять отклик');
    } finally {
      setLoading(false);
    }
  };

  // Handle bid rejection
  const handleRejectBid = async (bidId) => {
    if (!isProjectOwner) {
      setError('Только владелец проекта может отклонять отклики');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.patch(`/bids/bids/${bidId}/reject`);
      setSuccess('Отклик отклонен');
      fetchBids();
    } catch (err) {
      console.error('Ошибка при отклонении отклика:', err);
      setError(err.response?.data?.detail || 'Не удалось отклонить отклик');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="bid-system">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Показываем форму отклика только если:
          1. Пользователь не является владельцем проекта
          2. Проект активен (статус === 1)
      */}
      {!isProjectOwner && projectStatus === 1 && (
        <div className="bid-form-container">
          <h3>Оставить отклик</h3>
          <form onSubmit={handleSubmitBid} className="bid-form">
            <div className="form-group">
              <label>Цена</label>
              <input
                type="number"
                value={newBid.price}
                onChange={handlePriceChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Комментарий</label>
              <textarea
                value={newBid.comment}
                onChange={handleCommentChange}
                required
                rows="4"
              />
            </div>
            <button 
              type="submit" 
              className="submit-bid-button" 
              disabled={loading}
              onClick={() => console.log('Submit button clicked')}
            >
              {loading ? 'Отправка...' : 'Отправить отклик'}
            </button>
          </form>
        </div>
      )}

      {/* Показываем список откликов только владельцу проекта */}
      {isProjectOwner && (
        <div className="bids-list">
          <h3>Отклики на проект</h3>
          {bids.length === 0 ? (
            <p>Пока нет откликов</p>
          ) : (
            bids.map((bid) => (
              <div key={bid.id} className="bid-item">
                <div className="bid-info">
                  <p className="bid-price">{bid.price} ₽</p>
                  <p className="bid-comment">{bid.comment}</p>
                  <p className="bid-user">ID исполнителя: {bid.user_id}</p>
                  <p className="bid-status">Статус: {getBidStatusText(bid.status)}</p>
                </div>
                {/* Показываем кнопки принятия/отклонения только если проект активен */}
                {projectStatus === 1 && bid.status === 1 && (
                  <div className="bid-actions">
                    <button
                      onClick={() => handleAcceptBid(bid.id)}
                      className="accept-button"
                      disabled={loading}
                    >
                      Принять
                    </button>
                    <button
                      onClick={() => handleRejectBid(bid.id)}
                      className="reject-button"
                      disabled={loading}
                    >
                      Отклонить
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Вспомогательная функция для получения текста статуса
const getBidStatusText = (status) => {
  switch (status) {
    case 1:
      return 'В ожидании';
    case 2:
      return 'Принят';
    case 3:
      return 'Отклонен';
    default:
      return 'Неизвестно';
  }
};

export default BidSystem; 