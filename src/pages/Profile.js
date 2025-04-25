import React from "react";
import "../styles/Profile.css";
import Header from "../components/Header";

const Profile = () => {
  return (
    <div className="profile-container">
      <Header />

      <div className="profile-content">
        <div className="profile-left">
          <div className="avatar" />
          <div className="user-info">
            <p>Nick</p>
            <p>Seller</p>
            <p>Rating</p>
          </div>
        </div>

        <div className="profile-right">
          <div className="section">
            <div className="section-header">
              <h3>Активные предложения</h3>
              <button className="create-button">Создать заказ</button>
            </div>
          </div>

          <div className="section">
            <h3>История выполненных работ</h3>
          </div>

          <div className="reviews">
            <h3>Отзывы</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
