const db = require('../config/db.js');

// Promisify db.query
const queryPromise = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
};

const createUser = async (user) => {
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    return await queryPromise(query, [user.username, user.email, user.password]);
};

const findUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    return await queryPromise(query, [email]);
};

const findUserById = async (id) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    return await queryPromise(query, [id]);
};

const updateUserById = async (id, data) => {
    const fields = [];
    const values = [];
    
    if (data.username !== undefined) { 
        fields.push('username = ?'); 
        values.push(data.username); 
    }
    if (data.email !== undefined) { 
        fields.push('email = ?'); 
        values.push(data.email); 
    }
    if (data.avatar !== undefined) { 
        fields.push('avatar = ?'); 
        values.push(data.avatar); 
    }

    if (fields.length === 0) {
        return { affectedRows: 0 };
    }

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    return await queryPromise(query, values);
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserById,
    queryPromise
};