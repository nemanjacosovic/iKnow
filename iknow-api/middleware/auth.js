const jwt = require("jsonwebtoken");

// Middleware function to verify JWT token
const authenticateToken = (req, res, next) => {
  // Get the authorization header from the request
  const authHeader = req.headers["authorization"];

  // Extract token (format: "Bearer TOKEN")
  const token = authHeader && authHeader.split(" ")[1];

  // If no token is provided, return 401 Unauthorized
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Verify the token using the JWT secret
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    // Add the user info from the token to the request object
    req.user = decoded;

    // Continue to the next middleware/route handler
    next();
  } catch (err) {
    // If token is invalid, return 403 Forbidden
    return res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = { authenticateToken };
