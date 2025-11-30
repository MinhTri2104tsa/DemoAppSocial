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

##Các sự kiện (Events)

```
Event              Phát từ          Gửi tới        Hành động
──────────────────────────────────────────────────────────────
postsUpdated       postController   All clients    Tất cả refresh /api/posts
commentsUpdated    commentController All clients   Refresh comments cho post cụ thể
userUpdated        (tạo manual)      All clients   Cập nhật user info (dùng cho avatar)
```