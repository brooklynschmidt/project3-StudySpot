import { ObjectId } from "mongodb";
import { getDb } from "./connection.js";

const COLLECTION = "spots";

async function createSpot(spotData) {
  const db = getDb();
  const spot = {
    ...spotData,
    createdAt: new Date(),
  };
  const result = await db.collection(COLLECTION).insertOne(spot);
  return { ...spot, _id: result.insertedId };
}

async function getAllSpots() {
  const db = getDb();
  return await db.collection(COLLECTION).find({}).toArray();
}

async function getSpotById(id) {
  const db = getDb();
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

async function getSpotsByUser(userId) {
  const db = getDb();
  return await db.collection(COLLECTION).find({ createdBy: userId }).toArray();
}

async function updateSpot(id, updates) {
  const db = getDb();
  const result = await db
    .collection(COLLECTION)
    .updateOne({ _id: new ObjectId(id) }, { $set: updates });

  return result.modifiedCount > 0;
}

async function deleteSpot(id) {
  const db = getDb();
  const result = await db
    .collection(COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });

  return result.deletedCount > 0;
}

export {
  createSpot,
  getAllSpots,
  getSpotById,
  getSpotsByUser,
  updateSpot,
  deleteSpot,
};