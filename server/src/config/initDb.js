const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const queries = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) DEFAULT NULL,
    content TEXT,
    image_url VARCHAR(255) DEFAULT NULL,
    video_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT,
    parent_comment_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
];

// Ensure database exists first using a temporary connection without selecting a database
const ensureDatabase = () => {
  return new Promise((resolve, reject) => {
    const tmp = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      multipleStatements: true,
    });

    tmp.connect((err) => {
      if (err) {
        tmp.end();
        return reject(err);
      }
      const dbName = process.env.DB_NAME;
      const createDbQuery = `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;
      tmp.query(createDbQuery, (err) => {
        tmp.end();
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

const queryPromise = (db, query) => {
  return new Promise((resolve, reject) => {
    db.query(query, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

const init = async () => {
  console.log('Khởi tạo database và bảng nếu chưa tồn tại...');
  try {
    await ensureDatabase();
    // require the main db connection (which uses DB_NAME)
    const db = require('./db');
    for (const q of queries) {
      await queryPromise(db, q);
    }
    console.log('Database và tất cả bảng đã được tạo hoặc đã tồn tại.');
    if (require.main === module) process.exit(0);
  } catch (err) {
    console.error('Lỗi khi tạo database/bảng:', err);
    if (require.main === module) process.exit(1);
  }
};

if (require.main === module) {
  init();
} else {
  init().catch((e) => console.error(e));
}
