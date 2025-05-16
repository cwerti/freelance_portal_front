import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/BidSystem.css';

const BidSystem = ({ projectId, isOwner, userId, projectStatus }) => {
  const [bids, setBids] = useState([]);
  const [newBid, setNewBid] = useState({ price: '', comment: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch bids for the project
  const fetchBids = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/bids/by-user/${projectId}`);
      setBids(response.data);
    } catch (err) {
      setError('Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, [projectId]);

  // Handle bid submission
  const handleSubmitBid = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      await axios.post(`/api/bids/orders/${projectId}/bids`, {
        userId: userId,
        price: parseFloat(newBid.price),
        comment: newBid.comment
      });

      setSuccess('Bid submitted successfully!');
      setNewBid({ price: '', comment: '' });
      fetchBids();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit bid');
    } finally {
      setLoading(false);
    }
  };

  // Handle bid acceptance
  const handleAcceptBid = async (bidId) => {
    try {
      setLoading(true);
      await axios.patch(`/api/bids/bids/${bidId}/accept`);
      setSuccess('Bid accepted successfully!');
      fetchBids();
    } catch (err) {
      setError('Failed to accept bid');
    } finally {
      setLoading(false);
    }
  };

  // Handle bid rejection
  const handleRejectBid = async (bidId) => {
    try {
      setLoading(true);
      await axios.patch(`/api/bids/bids/${bidId}/reject`);
      setSuccess('Bid rejected successfully!');
      fetchBids();
    } catch (err) {
      setError('Failed to reject bid');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="bid-system">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {!isOwner && projectStatus === 1 && (
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

      {isOwner && (
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
                  <p className="bid-user">User ID: {bid.userId}</p>
                </div>
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