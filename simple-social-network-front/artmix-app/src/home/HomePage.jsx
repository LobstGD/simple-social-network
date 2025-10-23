import { useState, useEffect } from 'react';
import './HomePage.css'
import { useNavigate, useParams } from "react-router-dom";
import DonateModal from '../donate/DonateModal';

export default function HomePage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false); 
    const [isFollowed, setIsFollowed] = useState(false); 
    const [myAvatarColor, setMyAvatarColor] = useState('#bbb'); 
    const [myCustomAvatar, setMyCustomAvatar] = useState(null);
    const [posts, setPosts] = useState([]);

    const token = localStorage.getItem("jwtToken");
    const author = localStorage.getItem("username");

    // Загружаем аватар пользователя из localStorage
    useEffect(() => {
        const savedAvatar = localStorage.getItem(`avatar-${username}`);
        if (savedAvatar) {
            if (savedAvatar.startsWith('data:')) setMyCustomAvatar(savedAvatar);
            else setMyAvatarColor(savedAvatar);
        }
    }, [username]);

    // Загружаем посты только текущего пользователя
    useEffect(() => {
        const savedPosts = JSON.parse(localStorage.getItem('posts') || "[]");
        const userPosts = savedPosts.filter(p => p.username === username);
        setPosts(userPosts);
    }, [username]);

    const goHome = () => navigate("/");
    const goChat = () => navigate(`/chat/${username}`);
    const handleFollow = () => setIsFollowed(!isFollowed);

    const handleAvatarChange = (color) => {
        setMyAvatarColor(color);
        setMyCustomAvatar(null);
        localStorage.setItem(`avatar-${username}`, color);
        setShowAvatarModal(false);
    };

    const handleCustomAvatar = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setMyCustomAvatar(reader.result);
                localStorage.setItem(`avatar-${username}`, reader.result);
                setShowAvatarModal(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const isMyProfile = username === author;

    // ====== Создать пост ======
    const [newPostText, setNewPostText] = useState("");
    const [newPostImage, setNewPostImage] = useState(null);

    const handlePostImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setNewPostImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePost = (e) => {
        e.preventDefault();
        if (!newPostText && !newPostImage) return;

        const newPost = {
            id: Date.now(),
            username: author,
            avatar: myCustomAvatar || myAvatarColor,
            description: newPostText,
            image: newPostImage,
            likes: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 1000),
            shares: Math.floor(Math.random() * 1000)
        };

        const savedPosts = JSON.parse(localStorage.getItem('posts') || "[]");
        const updatedPosts = [newPost, ...savedPosts];
        localStorage.setItem('posts', JSON.stringify(updatedPosts));

        // Обновляем посты только для текущего пользователя
        setPosts([newPost, ...posts]);

        setNewPostText("");
        setNewPostImage(null);
    };

    if (!username) return <p>Загрузка...</p>;

    return (
        <div className='home-main'>
            <aside className='sidebar-left'>
                <div className='searching'>
                    <input type="text" placeholder="Search" className="search-box"/>
                    <button className='to-home' onClick={goHome}><h4>Home</h4></button>
                </div>
                <div className="user-card">
                    <div className="avatar" style={{ backgroundColor: '#ddd' }}/>
                    <span className="username">Someone</span>
                </div>
            </aside>

            <div className='main-feed'>
                <div className='profile-info'>
                    <div className='profile-avatar-container'>
                        {isMyProfile || myCustomAvatar || myAvatarColor ? (
                            <div 
                                className='my-profile-avatar'
                                style={{
                                    backgroundColor: myCustomAvatar ? 'transparent' : myAvatarColor,
                                    backgroundImage: myCustomAvatar ? `url(${myCustomAvatar})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            />
                        ) : (
                            <div className='profile-avatar'/>
                        )}
                    </div>

                    <div className='user-rows'>
                        <div className='first-row'>
                            <div className='username'><h2>{username}</h2></div>
                            {!isMyProfile && (
                                <>
                                    <button className={`follow-button ${isFollowed ? 'followed' : ''}`} onClick={handleFollow}>
                                        <h5>{isFollowed ? 'Followed' : 'Follow'}</h5>
                                    </button>
                                    <button className='follow-button donate' onClick={() => setShowModal(true)}>
                                        <h5>Donate</h5>
                                    </button>
                                </>
                            )}
                            {isMyProfile && (
                                <button className="profile-menu-btn" onClick={() => setShowAvatarModal(true)}>⋯</button>
                            )}
                        </div>

                        <div className='second-row'>
                            <div className='post-count'><h5>{posts.length} posts</h5></div>
                            <div className='followers-count'><h5>1,100 followers</h5></div>
                            <div className='following-count'><h5>100 following</h5></div>
                        </div>

                        <div className='third-row'>
                            <div className='description'><h4>Lorem ipsum - placeholder description</h4></div>
                        </div>

                        {!isMyProfile && (
                            <button className='follow-button chat-btn' onClick={goChat}><h5>Start message</h5></button>
                        )}
                    </div>
                </div>

                {/* ====== Создать пост ====== */}
                {isMyProfile && (
                    <div className="main-post-container">
                        <h2>Создать пост</h2>
                        <form className="create-post-form" onSubmit={handleCreatePost}>
                            <input
                                type="text"
                                placeholder="Что у вас нового?"
                                value={newPostText}
                                onChange={(e) => setNewPostText(e.target.value)}
                                className="post-input"
                            />

                            <label className="custom-file-upload">
                                {newPostImage ? "Изображение выбрано" : "Выбрать изображение"}
                                <input type="file" accept="image/*" onChange={handlePostImage}/>
                            </label>

                            {newPostImage && <img src={newPostImage} alt="preview" className="post-preview"/>}
                            <button type="submit" className="post-button">Опубликовать</button>
                        </form>
                    </div>
                )}

                {/* ====== Лента постов текущего пользователя ====== */}
                {posts.map(post => (
                    <div key={post.id} className='f-feed-posts'>
                        <div className='f-post-image'>
                            <div className='f-row'>
                                <div className='f-avatar' style={{backgroundColor: post.avatar}}/>
                                <div className='f-post-desc'>
                                    <div className='f-username'>{post.username}</div>
                                    <div className='f-description'>{post.description}</div>
                                </div>
                            </div>
                            {post.image && (
                                <div className='f-image'>
                                    <img src={post.image} alt="post" className='f-image-placeholder'/>
                                </div>
                            )}
                            <div className='f-active'>
                                <div className='f-com'>❤️ {post.likes}</div>
                                <div className='f-com'>💬 {post.comments}</div>
                                <div className='f-com'>🔄 {post.shares}</div>
                            </div>
                        </div>
                    </div>
                ))}

                {showAvatarModal && isMyProfile && (
                    <div className="modal-overlay">
                        <div className="modal-window">
                            <h2>Change Avatar</h2>
                            <p>Choose a color or upload your own image</p>
                            <div className="avatar-options">
                                <div className="avatar-color" style={{backgroundColor: 'green'}} onClick={() => handleAvatarChange('green')}></div>
                                <div className="avatar-color" style={{backgroundColor: 'yellow'}} onClick={() => handleAvatarChange('yellow')}></div>
                                <div className="avatar-color" style={{backgroundColor: 'pink'}} onClick={() => handleAvatarChange('pink')}></div>
                            </div>
                            <input type="file" accept="image/*" onChange={handleCustomAvatar}/>
                            <button className="close-modal" onClick={() => setShowAvatarModal(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                {showModal && <DonateModal onClose={() => setShowModal(false)} />}
            </div>
        </div>
    );
}
