import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import "./Chat.css";

export default function Chat() {
    const { username: chatWith } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [stompClient, setStompClient] = useState(null);

    const currentUser = localStorage.getItem("username");
    const token = localStorage.getItem("jwtToken");
    const navigate = useNavigate();

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const goHome = () => {
        navigate("/");
    };

    // Загружаем историю сообщений
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8080/messages/${currentUser}/${chatWith}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                    }
                );
                if (!res.ok) throw new Error("Ошибка загрузки истории чата");
                const data = await res.json();
                setMessages(data);
            } catch (err) {
                console.error("Ошибка загрузки истории:", err);
            }
        };
        if (currentUser && chatWith) fetchHistory();
    }, [currentUser, chatWith, token]);

    // Подключаем WebSocket
    useEffect(() => {
        const socket = new SockJS("http://localhost:8080/ws");
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log("✅ Connected to WebSocket");

            // Подписка на личные сообщения
            client.subscribe(`/user/${currentUser}/queue/messages`, (msg) => {
                const body = JSON.parse(msg.body);
                console.log("📩 Message received:", body);
                setMessages((prev) => [...prev, body]);
            });

            // Сохраняем клиента
            setStompClient(client);
        }, (error) => {
            console.error("❌ WebSocket error:", error);
        });

        return () => {
            client.disconnect(() => {
                console.log("❌ Disconnected from WebSocket");
            });
        };
    }, [currentUser]);

    const sendMessage = () => {
        if (!input.trim() || !stompClient) return;

        const chatMessage = {
            senderId: currentUser,
            recipientId: chatWith,
            content: input.trim(),
            timestamp: new Date(),
        };

        // Отправляем сообщение на бэкенд
        stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));

        // Добавляем в UI
        setMessages((prev) => [...prev, chatMessage]);
        setInput("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    return (
        <div className="chat-main">
            <aside className="sidebar-left">
                <div className="searching">
                    <input type="text" placeholder="Search" className="search-box" />
                    <button className="to-home" onClick={goHome}>
                        <h4>Home</h4>
                    </button>
                </div>

                <div className="user-card">
                    <img src="https://via.placeholder.com/40" className="avatar" alt="avatar" />
                    <span className="username">{chatWith}</span>
                </div>
            </aside>

            <div className="chat-side">
                <div className="user-row">
                    <div className="user-avatar" />
                    <div className="username">{chatWith}</div>
                </div>

                <div className="chat">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={
                                msg.senderId === currentUser
                                    ? "my-message-container"
                                    : "their-message-container"
                            }
                        >
                            <span>{msg.content}</span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="message-send">
                    <input
                        id="message-input"
                        className="message-input"
                        placeholder="Enter your message"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button className="send-button" onClick={sendMessage}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
