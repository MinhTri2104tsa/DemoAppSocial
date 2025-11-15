
const express = require('express');
const http = require("http");
const path = require('path');
const userRoutes = require('./routes/userRoutes.js');
const postRoutes = require('./routes/postRoutes.js');
const likeRoutes = require('./routes/likeRoutes.js');
const commentRoutes = require('./routes/commentRoutes.js');
const { Server } = require("socket.io");
const cors = require('cors');
const dotenv = require('dotenv');
require("./config/db.js");
const { setIo } = require('./socket.js');
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
//like routes
app.use("/api/likes", likeRoutes);
//comment routes
app.use("/api/comments", commentRoutes);

// Khởi tạo server HTTP + Socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], 
    methods: ["GET", "POST"]
  }
});

setIo(io);

// Khi có kết nối socket từ client
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
