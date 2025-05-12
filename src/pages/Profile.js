import React from "react";
import "../styles/Profile.css";

const Profile = () => {
  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-info">
          <h2>Nick: JohnDoe</h2>
          <p>Role: Seller</p>
          <p>Rating: ★★★★☆</p>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h3>Активные предложения</h3>
            <button className="create-order-button">Create Order</button>
          </div>
        </div>

        <div className="profile-section">
          <h3>История выполненных работ</h3>
        </div>

        <div className="profile-section large">
          <h3>Отзывы</h3>
        </div>
      </div>
    </div>
  );
};

export default Profile;
