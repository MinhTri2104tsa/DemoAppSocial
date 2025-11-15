const db = require('../config/db.js');

const createUser = async (user, callback) => {
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [user.username, user.email, user.password], callback);
};
const findUserByEmail = (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], callback);
}
const findUserById = (id, callback) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [id], callback);
}
 const updateUserById = (id, data, callback) => {
    const fields = [];
    const values = [];
    if (data.username !== undefined) { fields.push('username = ?'); values.push(data.username); }
    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
    if (data.avatar !== undefined) { fields.push('avatar = ?'); values.push(data.avatar); }

    if (fields.length === 0) {
        return callback(null, { affectedRows: 0 });
    }

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    db.query(query, values, callback);
}
module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserById
};