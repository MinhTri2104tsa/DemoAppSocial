#  DemoWebSocial - Social Media App

##  Project Structure

```
DemoWebSocial/
├── client/                          # React Frontend (Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── socketClient.js
│       ├── api/                     # API calls (Axios)
│       │   ├── axiosClient.js       # Interceptor (token auto-add)
│       │   ├── authApi.js
│       │   ├── userApi.js
│       │   ├── postApi.js
│       │   ├── commentApi.js
│       │   └── likeApi.js
│       ├── components/              # Reusable components
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── Modal.jsx
│       │   ├── PostCard.jsx
│       │   ├── PostItem.jsx
│       │   ├── PostForm.jsx
│       │   ├── CommentSection.jsx
│       │   └── LikeButton.jsx
│       ├── pages/                   # Page components
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── Profile.jsx
│       ├── context/                 # React Context
│       │   └── AuthContext.jsx
│       ├── utils/
│       │   └── auth.js              # Auth helpers (localStorage, token)
│       └── assets/
│
├── server/                          # Node.js/Express Backend
│   ├── package.json
│   ├── .env
│   ├── src/
│   │   ├── server.js                # Express app entry point
│   │   ├── socket.js                # Socket.IO setup
│   │   ├── config/
│   │   │   └── db.js                # MySQL connection
│   │   ├── models/                  # Data layer (Promisified)
│   │   │   ├── userModel.js
│   │   │   ├── postModel.js
│   │   │   ├── commentModel.js
│   │   │   └── likeModel.js
│   │   ├── controllers/             # Business logic (async/await)
│   │   │   ├── userController.js
│   │   │   ├── postController.js
│   │   │   ├── commentController.js
│   │   │   └── likeController.js
│   │   ├── routes/                  # API routes
│   │   │   ├── userRoutes.js
│   │   │   ├── postRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   └── likeRoutes.js
│   │   ├── middleware/              # Express middleware
│   │   │   ├── authMiddleware.js    # JWT verification
│   │   │   └── upload.js            # Multer file upload
│   │   └── controllers/
│   ├── migrations/                  # SQL migration scripts
│   │   └── create_tables.sql        # Initial schema
│   ├── uploads/                     # File storage
│   │   ├── images/
│   │   └── videos/
│   └── .env.example
│
├── Documentation Files (Root)
│   ├── README.md                    # This file
│  
│
└── .git/                            # Git repository
```

---

## Quick Start Setup

### Prerequisites
- Node.js 16+ & npm
- MySQL 8.+ (or later)
- Git
### 2. Backend Setup

```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Create .env file (copy from .env.example if available)
# Edit .env with your database credentials:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=demoweb
# PORT=4000
# JWT_SECRET=your_secret_key

# Start server (development)
npm run dev

# Server runs at http://localhost:4000
```

### 3. Frontend Setup

```bash
# Navigate to client folder (in new terminal)
cd client

# Install dependencies
npm install

# Start development server (Vite)
npm run dev

# Frontend runs at http://localhost:5173
```

---

## I. Tổng quan ngắn gọn

`DemoWebSocial` (repo: DemoAppSocial / workspace: DemoWebSocial) là một ứng dụng web mạng xã hội (frontend React + backend Express) cho phép:
- Tạo / sửa / xóa bài viết kèm media (ảnh, video)
- Like / Comment (có reply 1-level)
- Quản lý profile (avatar, username, email)
- Cập nhật thời thực bằng Socket.IO

**Sơ đồ ER (Entity Relationship):**

```
┌─────────────┐
│   users     │
├─────────────┤
│ id (PK)     │ ◄─────┐
│ username    │       │
│ email       │       │
│ password    │       │
│ avatar      │       │
│ created_at  │       │
└─────────────┘       │
        │ (1)         │ (N)
        │             │
        └──────────────┴────────┬──────────────┬──────────────┐
                                │              │              │
                        ┌─────────────┐  ┌──────────┐  ┌──────────┐
                        │   posts     │  │ comments │  │  likes   │
                        ├─────────────┤  ├──────────┤  ├──────────┤
                        │ id (PK)     │  │ id (PK)  │  │ id (PK)  │
                        │ user_id(FK) │  │ post_id  │  │ post_id  │
                        │ title       │  │ user_id  │  │ user_id  │
                        │ content     │  │ content  │  │ created_ │
                        │ image_url   │  │ parent_id│  │ at       │
                        │ video_url   │  │ created_at│ └──────────┘
                        │ created_at  │  └──────────┘
                        │ updated_at  │       │
                        └─────────────┘       │
                                │ (1)        │ (N, self)
                                │            │
                                └────────────┴──→ (comments reply to comments)
                            
Users API

```
Method | Endpoint          | Auth | Description
────────────────────────────────────────────────────────
POST   | /api/users/register    | -    | Đăng ký tài khoản mới
POST   | /api/users/login       | -    | Đăng nhập, trả JWT token
GET    | /api/users/me          | ✓    | Lấy thông tin user hiện tại
PUT    | /api/users/me          | ✓    | Cập nhật profile & avatar (multipart)

Posts API

```
Method | Endpoint          | Auth | Description
────────────────────────────────────────────────────────
GET    | /api/posts             | -    | Lấy danh sách tất cả posts (kèm avatar, likes, comments count)
POST   | /api/posts/create      | ✓    | Tạo post mới (multipart: content, images[], videos[])
PUT    | /api/posts/:id         | ✓    | Cập nhật post (chỉ author)
DELETE | /api/posts/:id         | ✓    | Xóa post (chỉ author)

Comments API

```
Method | Endpoint          | Auth | Description
────────────────────────────────────────────────────────
GET    | /api/comments/:postId  | -    | Lấy comments & replies cho post
POST   | /api/comments          | ✓    | Tạo comment/reply mới (content, post_id, parent_comment_id?)
PUT    | /api/comments/:id      | ✓    | Cập nhật comment (chỉ author)
DELETE | /api/comments/:id      | ✓    | Xóa comment (chỉ author)

Likes API

```
Method | Endpoint          | Auth | Description
────────────────────────────────────────────────────────
POST   | /api/likes/toggle      | ✓    | Like/Unlike post (toggle)
GET    | /api/likes/:postId     | -    | Lấy danh sách likes cho post

Công nghệ Real-time (Socket.IO)

## Mục đích

- Phát sóng sự kiện (event broadcasting) tới tất cả client kết nối.
- Khi có thay đổi (post mới, comment mới, like, etc.), client tự động fetch dữ liệu mới mà không cần refresh.

## Các sự kiện (Events)

```
postsUpdated    → Khi có post mới, sửa, hoặc xóa
commentsUpdated → Khi có comment mới, sửa, hoặc xóa
postUpdated     → Khi có thay đổi like count
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool & dev server
- **React Router 7** - Client-side routing
- **Axios** - HTTP client (with JWT interceptor)
- **Socket.io-client** - Real-time WebSocket
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MySQL2** - Database driver
- **Socket.io** - Real-time server
- **Bcrypt** - Password hashing
- **JWT (jsonwebtoken)** - Authentication
- **Multer** - File upload middleware
- **CORS** - Cross-origin requests
- **Dotenv** - Environment variables

### Database
- **MySQL** - Relational database


## 📄 License

ISC

---

**Repository:** [DemoAppSocial](https://github.com/MinhTri2104tsa/DemoAppSocial)  
**Last Updated:** December 1, 2025  
**Version:** 2.0 (Async/Await Refactored)

```
