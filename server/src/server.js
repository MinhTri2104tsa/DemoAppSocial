
const express = require('express');
const http = require("http");
const userRoutes = require('./routes/userRoutes.js');
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
server.listen(PORT, () => console.log(`✅ Server chạy tại http://localhost:${PORT}`));
