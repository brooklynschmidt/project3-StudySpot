import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";

import { connect, disconnect } from "./db/connection.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import spotRoutes from "./routes/spots.js";

import "./config/passport.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "../frontend/dist");

/* -------------------- middleware -------------------- */
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

/* -------------------- API routes -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/spots", spotRoutes);

/* -------------------- static frontend -------------------- */
app.use(express.static(distPath));

/* -------------------- IMPORTANT: explicit robots.txt -------------------- */
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.sendFile(path.join(distPath, "robots.txt"));
});

/* -------------------- SPA fallback (MUST be last) -------------------- */
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

/* -------------------- server start -------------------- */
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

/* -------------------- cleanup -------------------- */
process.on("SIGINT", async () => {
  await disconnect();
  process.exit(0);
});

start();
