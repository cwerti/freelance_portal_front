import React from "react";
import "../styles/Home.css";
import { BlockList } from "../components/Blocks.jsx"

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Добро пожаловать в Freelance_STUdio</h1>

        <div className="search-section">
          <input
            type="text"
            placeholder="Поиск услуг..."
            className="search-input"
          />
          <button className="search-button">Поиск</button>
        </div>

        <div className="category-section">
          <h2>Категории</h2>
          <div className="category-list">
            <div className="category-card">Дизайн</div>
            <div className="category-card">Программирование</div>
            <div className="category-card">Маркетинг</div>
            <div className="category-card">Переводы</div>
          </div>
          <BlockList />
        </div>
      </div>
    </div>
  );
};

export default Home;
