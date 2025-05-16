import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/BidSystem.css';

const BidSystem = ({ projectId, projectOwnerId, currentUserId, projectStatus }) => {
  const [bids, setBids] = useState([]);
  const [newBid, setNewBid] = useState({ price: '', comment: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Определяем, является ли текущий пользователь владельцем проекта
  const isProjectOwner = currentUserId === projectOwnerId;

  // Fetch bids for the project
  const fetchBids = async () => {
    try {
      setLoading(true);
      // Получаем все отклики для данного проекта
      const response = await axios.get(`/bids/by-user/${projectId}`);
      setBids(response.data);
    } catch (err) {
      setError('Failed to load bids');
      console.error('Error fetching bids:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchBids();
    }
  }, [projectId]);

  // Handle bid submission
  const handleSubmitBid = async (e) => {
    e.preventDefault();
    
    // Проверяем, не является ли пользователь владельцем проекта
    if (isProjectOwner) {
      setError('You cannot bid on your own project');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Используем правильный URL для создания отклика
      await axios.post(`/bids/orders/${projectId}/bids`, {
        userId: currentUserId,
        price: parseFloat(newBid.price),
        comment: newBid.comment
      });

      setSuccess('Bid submitted successfully!');
      setNewBid({ price: '', comment: '' });
      fetchBids(); // Обновляем список откликов
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit bid');
      console.error('Error submitting bid:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle bid acceptance
  const handleAcceptBid = async (bidId) => {
    // Проверяем, является ли текущий пользователь владельцем проекта
    if (!isProjectOwner) {
      setError('Only project owner can accept bids');
      return;
    }

    try {
      setLoading(true);
      // Используем правильный URL для принятия отклика
      await axios.patch(`/bids/bids/${bidId}/accept`);
      setSuccess('Bid accepted successfully!');
      fetchBids(); // Обновляем список откликов
    } catch (err) {
      setError('Failed to accept bid');
      console.error('Error accepting bid:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle bid rejection
  const handleRejectBid = async (bidId) => {
    // Проверяем, является ли текущий пользователь владельцем проекта
    if (!isProjectOwner) {
      setError('Only project owner can reject bids');
      return;
    }

    try {
      setLoading(true);
      // Используем правильный URL для отклонения отклика
      await axios.patch(`/bids/bids/${bidId}/reject`);
      setSuccess('Bid rejected successfully!');
      fetchBids(); // Обновляем список откликов
    } catch (err) {
      setError('Failed to reject bid');
      console.error('Error rejecting bid:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

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
          <h3>Submit Your Bid</h3>
          <form onSubmit={handleSubmitBid} className="bid-form">
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                value={newBid.price}
                onChange={(e) => setNewBid({ ...newBid, price: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Comment</label>
              <textarea
                value={newBid.comment}
                onChange={(e) => setNewBid({ ...newBid, comment: e.target.value })}
                required
                rows="4"
              />
            </div>
            <button type="submit" className="submit-bid-button">
              Submit Bid
            </button>
          </form>
        </div>
      )}

      {/* Показываем список откликов только владельцу проекта */}
      {isProjectOwner && (
        <div className="bids-list">
          <h3>Project Bids</h3>
          {bids.length === 0 ? (
            <p>No bids yet</p>
          ) : (
            bids.map((bid) => (
              <div key={bid.id} className="bid-item">
                <div className="bid-info">
                  <p className="bid-price">${bid.price}</p>
                  <p className="bid-comment">{bid.comment}</p>
                  <p className="bid-user">Bidder ID: {bid.userId}</p>
                </div>
                {/* Показываем кнопки принятия/отклонения только если проект активен */}
                {projectStatus === 1 && (
                  <div className="bid-actions">
                    <button
                      onClick={() => handleAcceptBid(bid.id)}
                      className="accept-button"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectBid(bid.id)}
                      className="reject-button"
                    >
                      Reject
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

export default BidSystem; 