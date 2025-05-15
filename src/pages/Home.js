import React from "react";
import "../styles/Home.css";
import { BlockList } from "../components/Blocks.js"
import { Link } from "react-router-dom";
import ParticlesBg from 'particles-bg'

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
              <i class="fas fa-seedling"></i>
              <Link to="/category/Дизайн" className="category-card">Дизайн</Link>
              <Link to="/category/Программирование" className="category-card">Программирование</Link>
              <Link to="/category/Маркетинг" className="category-card">Маркетинг</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
