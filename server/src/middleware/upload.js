const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Kiểm tra thư mục tồn tại chưa, nếu chưa thì tạo
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.mimetype.startsWith("video/") ? "uploads/videos" : "uploads/images";
    ensureDir(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // tối đa 50MB
});
module.exports = upload;