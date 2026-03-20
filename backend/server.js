import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import path from "path";

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

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

async function start() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("Error: MONGO_URI is not set");
      process.exit(1);
    }

    await connect(mongoUri);
    console.log("MongoDB connected\n");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
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