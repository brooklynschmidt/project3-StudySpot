import { Router } from "express";
import passport from "passport";
import { createUser } from "../db/users.js";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName)
      return res.status(400).json({ error: "All fields are required" });

    const user = await createUser({ email, password, firstName, lastName });
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Login failed after signup" });
      return res.status(201).json(user);
    });
  } catch (err) {
    if (err.message === "Email already in use") return res.status(409).json({ error: err.message });
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message });

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json(user);
    });
  })(req, res, next);
  console.log("Passport Authenticated");
});

router.post("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
});

export default router;