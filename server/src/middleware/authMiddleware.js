const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  console.log("\n ===== AUTH MIDDLEWARE =====");
  console.log("Token header:", token?.substring(0, 50));
  
  if (!token) {
    console.error("NO TOKEN PROVIDED");
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const tokenParts = token.split(' ');
    console.log("Token parts length:", tokenParts.length);
    
    const bearerToken = tokenParts[1];
    if (!bearerToken) {
      console.error("INVALID TOKEN FORMAT - no Bearer token");
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    console.log("Bearer token found:", bearerToken.substring(0, 30) + "...");
    
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", decoded);
    console.log("decoded.id =", decoded.id);
    
    req.user = { id: decoded.id };
    req.userId = decoded.id;
    
    console.log("req.user set to:", req.user);
    console.log("req.userId set to:", req.userId);
    console.log("===== END AUTH MIDDLEWARE =====\n");
    
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    console.error("===== END AUTH MIDDLEWARE =====\n");
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
}

module.exports = {
  verifyToken
};