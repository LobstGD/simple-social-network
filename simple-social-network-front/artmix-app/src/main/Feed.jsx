import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Feed.css'

export default function Feed() {

    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [posts, setPosts] = useState([]);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");

    const token = localStorage.getItem("jwtToken");
    const username = localStorage.getItem("username");

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch("http://localhost:8080/posts/feed", {
                    method: "GET",
                    headers: {"Authorization": `Bearer ${token}`}
                });
                const data = await res.json();
                setPosts(data);
            } catch (error) {
                console.error("Ошибка загрузки постов:", error);
            }
        };
        fetchPosts();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!token) console.log("Not user found");

        try {
            const response = await fetch("http://localhost:8080/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({title, content})
            });

            if(!response.ok) console.log("Error is: " + response.status);
            else {
                const createdPost = await response.json();
                setPosts(prev => [createdPost, ...prev]);
                setTitle("");
                setContent("");
            }
        } catch (error) {
            console.log("Error is: " + error);
        }
    }

    function startEditing(post) {
        setEditingPostId(post.id);
        setEditTitle(post.title);
        setEditContent(post.content)
    }

    async function updatePost(e) {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/posts/${editingPostId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({title: editTitle, content: editContent})
            });
            if(!response.ok) console.log("Updating error: " + response.status);
            else {
                const updated = posts.map(p =>
                    p.id === editingPostId ? { ...p, title: editTitle, content: editContent } : p
                );
                setPosts(updated);
                setEditingPostId(null);
            }
        } catch (error) {
            console.log("Error is: " + error);
        }
    }

    async function deletePost(id) {
        try {
            const res = await fetch(`http://localhost:8080/posts/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) setPosts(prev => prev.filter(p => p.id !== id));
            else console.log("Ошибка удаления: " + res.status);
        } catch (err) {
            console.error("Ошибка удаления поста:", err);
        }
    }

    const getAvatar = (user) => {
        const saved = localStorage.getItem(`avatar-${user}`);
        if (!saved) return '#bbb';
        if (saved.startsWith('data:')) return `url(${saved})`;
        return saved;
    }

    return (
        <main className="f-feed">
            <div className="f-post f-create-post">
                <h2>Создать пост</h2>
                <form className="f-create-post-form" onSubmit={handleSubmit}>
                    <input
                        id="post-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Заголовок..."
                        className="f-post-input" />
                    <textarea
                        id="post-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Что у вас нового?"
                        className="f-post-textarea"></textarea>
                    <button type="submit" className="f-post-button">Опубликовать</button>
                </form>
            </div>

            {posts.length === 0 && <p className="f-no-posts">Постов пока нет 😢</p>}

            {posts.map((post) => (
                <div key={post.id} className="f-feed-posts">
                    <div className="f-post-image">
                        <div className="f-row">
                            <div 
                                className="f-avatar" 
                                style={{
                                    backgroundColor: getAvatar(post.author).startsWith('url') ? 'transparent' : getAvatar(post.author),
                                    backgroundImage: getAvatar(post.author).startsWith('url') ? getAvatar(post.author) : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                                onClick={() => navigate(`/${post.author}`)}
                            />
                            <div className="f-post-desc">
                                <div className="f-username"><b>{post.author}</b></div>

                                {editingPostId === post.id ? (
                                    <form onSubmit={updatePost}>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="f-post-input"
                                        />
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="f-post-textarea"
                                        ></textarea>
                                        <button type="submit" className="f-post-button">Сохранить</button>
                                        <button type="button" onClick={() => setEditingPostId(null)}>Отмена</button>
                                    </form>
                                ) : (
                                    <>
                                        <div className="f-description">{post.title}</div>
                                        <div className="f-text-image">
                                            <span>{post.content}</span>
                                        </div>

                                        <div className='fm-active'>
                                            {/* Комментарии */}
                                            <div className='f-com'>
                                                <svg width="16" height="16" viewBox="207 257 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M231,273 C229.896,273 229,272.104 229,271 C229,269.896 229.896,269 231,269 C232.104,269 233,269.896 233,271 C233,272.104 232.104,273 231,273 Z M223,273 C221.896,273 221,272.104 221,271 C221,269.896 221.896,269 223,269 C224.104,269 225,269.896 225,271 C225,272.104 224.104,273 223,273 Z M215,273 C213.896,273 213,272.104 213,271 C213,269.896 213.896,269 215,269 C216.104,269 217,269.896 217,271 C217,272.104 216.104,273 215,273 Z M223,257 C214.164,257 207,263.269 207,271 C207,275.419 209.345,279.354 213,281.919 L213,289 L220.009,284.747 C220.979,284.907 221.977,285 223,285 C231.836,285 239,278.732 239,271 C239,263.269 231.836,257 223,257 Z"/>
                                                </svg>
                                                350
                                            </div>

                                            {/* Просмотры */}
                                            <div className='f-com'>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '4px'}}>
                                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zm-8 4a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
                                                <circle cx="8" cy="8" r="2.5"/>
                                                </svg>
                                                10,100
                                            </div>

                                            {/* Лайки */}
                                            <div className='f-com'>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '4px'}}>
                                                <path fillRule="evenodd" clipRule="evenodd" d="M15.9 4.5C15.9 3 14.418 2 13.26 2c-.806 0-.869.612-.993 1.82-.055.53-.121 1.174-.267 1.93-.386 2.002-1.72 4.56-2.996 5.325V17C9 19.25 9.75 20 13 20h3.773c2.176 0 2.703-1.433 2.899-1.964l.013-.036c.114-.306.358-.547.638-.82.31-.306.664-.653.927-1.18.311-.623.27-1.177.233-1.67-.023-.299-.044-.575.017-.83.064-.27.146-.475.225-.671.143-.356.275-.686.275-1.329 0-1.5-.748-2.498-2.315-2.498H15.5S15.9 6 15.9 4.5zM5.5 10A1.5 1.5 0 0 0 4 11.5v7a1.5 1.5 0 0 0 3 0v-7A1.5 1.5 0 0 0 5.5 10z"/>
                                                </svg>
                                                1,200
                                            </div>
                                        </div>

                                        {username === post.author && (
                                            <div className="f-actions">
                                                <button onClick={() => startEditing(post)}>Изменить</button>
                                                <button onClick={() => deletePost(post.id)}>Удалить</button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </main>
    )
}
