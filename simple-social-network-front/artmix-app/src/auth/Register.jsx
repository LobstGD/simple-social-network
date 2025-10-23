import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const validatePassword = (pass) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!regex.test(pass)) {
      return "Пароль должен содержать минимум 8 символов, одну заглавную букву, цифру и спецсимвол.";
    }
    return "";
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const error = validatePassword(password);
    if (error) {
      setPasswordError(error);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });

      if (!response.ok) {
        alert("Ошибка регистрации");
        return;
      }

      console.log("Пользователь успешно зарегистрирован");
      navigate("/login");
    } catch (error) {
      console.log("Ошибка регистрации:", error);
    }
  }

  return (
    <div className="register-wrapper">
      <div className="register-page">
        <div className="register-left">
          <img
            src="https://images.unsplash.com/photo-1522204502310-2090d05bdb4d"
            alt="Welcome"
          />
        </div>

        <div className="register-right">
          <div className="register-box">
            <h2>Регистрация</h2>
            <form className="register-form" onSubmit={handleSubmit}>
              <label htmlFor="username">Логин</label>
              <input
                id="username"
                type="text"
                placeholder="Введите логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {passwordError && (
                <p className="error-text">{passwordError}</p>
              )}

              <label htmlFor="email">Почта</label>
              <input
                id="email"
                type="email"
                placeholder="Введите почту"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button className="register-button" type="submit">
                Зарегистрироваться
              </button>
            </form>

            <p className="register-link">
              Есть аккаунт? <a href="/login">Войти</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
