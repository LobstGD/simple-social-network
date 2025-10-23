import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import LeftSideBar from "./LeftSideBar/LeftSideBar";
import Feed from "./main/Feed";
import HomePage from "./home/HomePage";
import Chat from "./chat/Chat";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const location = useLocation(); // ✅ получаем текущий путь

  // Проверяем токен при загрузке
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const savedUsername = localStorage.getItem("username");

    if (token && savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
    } else {
      // 🟡 Редиректим на /login только если мы не на /register или /login
      if (location.pathname !== "/login" && location.pathname !== "/register") {
        navigate("/login");
      }
    }
  }, [navigate, location.pathname]);

  // После успешного логина
  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setUsername(user);
    localStorage.setItem("username", user);
    navigate("/"); // 🔵 Отправляем в ленту
  };

  // Logout — очистка данных и редирект
  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername("");
    navigate("/login");
  };

  return (
    <>
      {!isLoggedIn ? (
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="container">

          <Routes>
            <Route
              path="/"
              element={
                <>
                  <LeftSideBar />
                  <Feed />
                </>
              }
            />
            <Route path="/:username" element={<HomePage />} />
            <Route path="/chat/:username" element={<Chat />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      )}
    </>
  );
}

export default App;
