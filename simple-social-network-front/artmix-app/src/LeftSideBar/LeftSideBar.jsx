import './LeftSideBar.css'
import { useNavigate } from "react-router-dom";

export default function LeftSideBar() {
    const navigate = useNavigate();
    const username = localStorage.getItem("username");

    const goProfile = () => { 
        navigate(`/${username}`);
    }

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("username");
        navigate("/login"); // 🔥 моментально перебрасывает на страницу логина
    }

    // Получаем аватарку пользователя
    const getAvatar = (user) => {
        const saved = localStorage.getItem(`avatar-${user}`);
        if (!saved) return '#bbb';
        if (saved.startsWith('data:')) return saved; // custom image
        return saved; // цвет
    }

    const avatar = getAvatar(username);

    return (
        <aside className="left-navigation">
            <div className="site-navigation">
                <button className="nav-button">
                    <div className="nav-icon" />
                    <span>Main</span>
                </button>

                <button className="nav-button">
                    <div className="nav-icon" />
                    <span>Explore</span>
                </button>

                <button className="nav-button">
                    <div className="nav-icon" />
                    <span>Notifications</span>
                </button>

                <button className="nav-button">
                    <div className="nav-icon" />
                    <span>Communities</span>
                </button>

                <button className="nav-button" onClick={goProfile}>
                    <div className="nav-icon" />
                    <span>Profile</span>
                </button>

                <button className="nav-button">
                    <div className="nav-icon" />
                    <span>More</span>
                </button>

                <button className="nav-button" onClick={handleLogout}>
                    <div className="nav-icon" />
                    <span>Log Out</span>
                </button>
            </div>

            <div className="user-card" onClick={goProfile}>
                {avatar.startsWith('data:') ? (
                    <img src={avatar} alt="User avatar" className="user-avatar" />
                ) : (
                    <div
                        className="user-avatar"
                        style={{ backgroundColor: avatar }}
                    />
                )}
                <div className="user-info">
                    <h4>{username}</h4>
                    <p>@{username}</p>
                </div>
            </div>
        </aside>
    );
}
