import React from "react";
import "../styles/Home.css";


const Home = () => {
  return (
    <div className="home">
      <main className="home-main">
        <section className="banner">
          <h1>Найдите идеального фрилансера для вашей задачи</h1>
          <p>Выполняйте работу быстро, доступно и профессионально</p>
        </section>

        <section className="categories">
          <h2>Популярные категории</h2>
          <div className="category-grid">
            <div className="category-card">Дизайн</div>
            <div className="category-card">Разработка</div>
            <div className="category-card">Письмо</div>
            <div className="category-card">Маркетинг</div>
            <div className="category-card">Видео и анимация</div>
            <div className="category-card">Музыка и аудио</div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>© 2025 Freelance_STUdio. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default Home;
