import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  return (
    <header className="header">
      <Link to="/" className="logo">
        <span>Freelance_</span>
        <span className="studio">STUdio</span>
      </Link>
      <div className="auth-buttons">
        <Link to="/login">
          <button className="auth-btn">Войти</button>
        </Link>
        <Link to="/register">
          <button className="auth-btn">Зарегистрироваться</button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
