const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3600;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "iknowdb",
  password: "your_password", // Replace with your actual password
  port: 5432,
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your_jwt_secret",
    (err, user) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = user;
      next();
    }
  );
};

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/categories", authenticateToken, require("./routes/categories"));
app.use("/api/questions", authenticateToken, require("./routes/questions"));
app.use("/api/sets", authenticateToken, require("./routes/sets"));
app.use("/api/users", authenticateToken, require("./routes/users"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
