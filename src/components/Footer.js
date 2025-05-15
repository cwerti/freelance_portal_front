import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">Freelance_STUdio</div>
        <div className="footer-links">
          <a href="/">Главная</a>
          <a href="/about">О нас</a>
        </div>
        <div className="footer-copy">
          &copy; {new Date().getFullYear()} Freelance_STUdio. Все права защищены.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
