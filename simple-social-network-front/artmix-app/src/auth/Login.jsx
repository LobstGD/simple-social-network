import './Login.css'
import { useState } from 'react';

export default function Login({ onLoginSuccess }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error("Ошибка при входе");

      const token = await response.text();

      console.log(response)
      localStorage.setItem("jwtToken", token);
      onLoginSuccess(username); 

    } catch (error) {
      
      console.error("Ошибка логина:", error);
      alert("Неверный логин или пароль");
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
            <h2>Вход в аккаунт</h2>
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

              <button className="register-button" type="submit">
                Войти
              </button>
            </form>

            <p className="register-link">
              Нет аккаунта? <a href="/register">Зарегистрироваться</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
