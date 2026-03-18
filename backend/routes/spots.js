import { Router } from "express";
import {
  createSpot,
  getAllSpots,
  getSpotById,
  getSpotsByUser,
  updateSpot,
  deleteSpot,
} from "../db/spots.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { createdBy } = req.query;
    const spots = createdBy
      ? await getSpotsByUser(createdBy)
      : await getAllSpots();
    res.json(spots);
  } catch (err) {
    console.error("Get spots error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const spot = await getSpotById(req.params.id);
    if (!spot) {
      return res.status(404).json({ error: "Spot not found" });
    }
    res.json(spot);
  } catch (err) {
    console.error("Get spot error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      name,
      address,
      category,
      noiseLevel,
      groupFriendly,
      hours,
      description,
      status,
      pos,
      createdBy,
    } = req.body;

    if (!name || !address || !category || !pos) {
      return res
        .status(400)
        .json({ error: "Name, address, category, and location are required" });
    }

    const spot = await createSpot({
      name,
      address,
      category,
      noiseLevel,
      groupFriendly,
      hours,
      description,
      status,
      pos,
      createdBy,
    });

    res.status(201).json(spot);
  } catch (err) {
    console.error("Create spot error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await updateSpot(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Spot not found or no changes" });
    }
    const spot = await getSpotById(req.params.id);
    res.json(spot);
  } catch (err) {
    console.error("Update spot error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await deleteSpot(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Spot not found" });
    }
    res.json({ message: "Spot deleted" });
  } catch (err) {
    console.error("Delete spot error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;