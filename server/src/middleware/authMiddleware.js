const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const tokenParts = token.split(' ');
    
    const bearerToken = tokenParts[1];
    if (!bearerToken) {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    
    req.user = { id: decoded.id };
    req.userId = decoded.id;
    
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
}

module.exports = {
  verifyToken
};