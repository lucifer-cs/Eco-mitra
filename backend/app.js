const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());  //  frontend requests


app.use(express.static(path.join(__dirname, "../frontend")));  //  path

//  Route for index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});


// aggregator User Registration
app.post("/auth/aggregator/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [username, email, hashedPassword]
        );
        res.json({ message: "User registered successfully", user: newUser.rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error registering user" });
    }
});

// aggregator User Login
app.post("/auth/aggregator/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(401).json({ error: "User not found" });

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Error logging in" });
    }
});


// business User Registration
app.post("/auth/business/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [username, email, hashedPassword]
        );
        res.json({ message: "User registered successfully", user: newUser.rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error registering user" });
    }
});

// business User Login
app.post("/auth/business/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(401).json({ error: "User not found" });

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Error logging in" });
    }
});


app.get("/", (req, res) => {
    res.send("Welcome to the Auth API!");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
