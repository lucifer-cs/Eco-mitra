const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
require("dotenv").config();

const router = express.Router();

// Register Endpoint
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert User into Database
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;


//login

// Login Endpoint
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Compare Passwords
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
