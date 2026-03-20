import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";

import { connect, disconnect } from "./db/connection.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import spotRoutes from "./routes/spots.js";

import "./config/passport.js"; 


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, 
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/spots", spotRoutes);

app.get("/", (req, res) => res.send("API running"));

async function start() {
  try {
    await connect("mongodb://localhost:27017/Login");
    console.log("connected\n");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await disconnect();
  process.exit(0);
});

start();