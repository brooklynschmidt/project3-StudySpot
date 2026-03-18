import express from "express";
import dotenv from "dotenv";
import { connect, disconnect } from "./db/connection.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import spotRoutes from "./routes/spots.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/spots", spotRoutes);

async function start() {
  try {
    await connect(process.env.MONGO_URI);
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