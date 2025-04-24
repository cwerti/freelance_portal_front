import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home-container">
      <header className="header">
        <div className="logo">Freelance_STUdio</div>

        <div className="search-bar">
          <input type="text" placeholder="Search..." />
          <button>Search</button>
        </div>

        <div className="auth-buttons">
          <Link to="/login">
            <button className="sign-in">Sign in</button>
          </Link>
          <Link to="/register">
            <button className="sign-up">Sign up</button>
          </Link>
        </div>
      </header>

      <div className="banner">Photo*</div>

      <div className="main-section">
        <aside className="sidebar">
          <h2>Services</h2>
          <p>Categories</p>
        </aside>

        <div className="cards">
          {/* Здесь можно разместить карточки проектов */}
          {[...Array(6)].map((_, i) => (
            <div className="card" key={i}></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
