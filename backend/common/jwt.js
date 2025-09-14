const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "supersecretkey";

exports.verifyTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header exists and is in the correct format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Missing or invalid Authorization header." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;  // Attach decoded user info to request
    next();  // Proceed to next middleware or route handler
  } catch (err) {
    // Handle token expiration error separately
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token." });
  }
};
