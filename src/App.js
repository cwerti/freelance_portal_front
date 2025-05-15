import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import AdminPanel from "./pages/AdminPanel";
import Chats from "./pages/Chats";
import Chat from "./pages/Chat";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} /> {/* маршрут */}
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/Chats" element={<Chats  userId={1}/>}  />
        <Route path="/Chat" element={<Chat />}  />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
