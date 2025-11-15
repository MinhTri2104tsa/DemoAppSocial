
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Kết nối MySQL thất bại:", err.message);
    process.exit(1);
  }
  console.log("Đã kết nối MySQL\n");
  checkDatabase();
});

function checkDatabase() {
  // Check users table structure
  console.log("===== USERS TABLE =====");
  db.query("DESCRIBE users", (err, results) => {
    if (err) {
      console.error("Lỗi khi kiểm tra bảng users:", err.message);
    } else {
      console.log("Cấu trúc bảng 'users':");
      results.forEach((col) => {
        console.log(`  - ${col.Field} (${col.Type}) ${col.Null === "NO" ? "NOT NULL" : "NULL"}`);
      });
    }

    // Check users data
    console.log("\nDữ liệu trong bảng 'users':");
    db.query("SELECT id, username, email FROM users LIMIT 5", (err, results) => {
      if (err) {
        console.error("Lỗi:", err.message);
      } else {
        if (results.length === 0) {
          console.log(" Không có user nào trong database!");
        } else {
          results.forEach((user) => {
            console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
          });
        }
      }

      // Check posts table structure
      console.log("\n===== POSTS TABLE =====");
      db.query("DESCRIBE posts", (err, results) => {
        if (err) {
          console.error("Lỗi khi kiểm tra bảng posts:", err.message);
        } else {
          console.log("Cấu trúc bảng 'posts':");
          results.forEach((col) => {
            console.log(`  - ${col.Field} (${col.Type}) ${col.Null === "NO" ? "NOT NULL" : "NULL"}`);
          });
        }

        // Check posts data
        console.log("\nDữ liệu trong bảng 'posts':");
        db.query("SELECT * FROM posts LIMIT 5", (err, results) => {
          if (err) {
            console.error("Lỗi:", err.message);
          } else {
            if (results.length === 0) {
              console.log("  Không có post nào trong database!");
            } else {
              results.forEach((post) => {
                console.log(`  - ID: ${post.id}, User ID: ${post.user_id}, Content: ${post.content?.substring(0, 30)}...`);
              });
            }
          }

          db.end();
        });
      });
    });
  });
}
