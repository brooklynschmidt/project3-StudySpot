import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { getDb } from "./connection.js";

const COLLECTION = "users";

async function createUser({ email, password, firstName, lastName }) {
  const db = getDb();
  const existing = await db
    .collection(COLLECTION)
    .findOne({ email: email.toLowerCase() });

  if (existing) {
    throw new Error("Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    email: email.toLowerCase(),
    password: hashedPassword,
    firstName,
    lastName,
    initials: (firstName.charAt(0) + lastName.charAt(0)).toUpperCase(),
    preferences: {
      noise: "",
      group: "",
      category: "",
    },
    createdAt: new Date(),
  };

  const result = await db.collection(COLLECTION).insertOne(user);
  const { password: _, ...safeUser } = { ...user, _id: result.insertedId };
  return safeUser;
}

async function findUserByEmail(email) {
  const db = getDb();
  return await db
    .collection(COLLECTION)
    .findOne({ email: email.toLowerCase() });
}

async function findUserById(id) {
  const db = getDb();
  const user = await db
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(id) });

  if (!user) return null;

  const { password: _, ...safeUser } = user;
  return safeUser;
}

async function updateUser(id, updates) {
  const db = getDb();

  const allowed = [
    "firstName",
    "lastName",
    "preferences",
  ];
  const filtered = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      filtered[key] = updates[key];
    }
  }

  if (filtered.firstName || filtered.lastName) {
    const current = await db
      .collection(COLLECTION)
      .findOne({ _id: new ObjectId(id) });
    const first = filtered.firstName || current.firstName;
    const last = filtered.lastName || current.lastName;
    filtered.initials = (first.charAt(0) + last.charAt(0)).toUpperCase();
  }

  const result = await db
    .collection(COLLECTION)
    .updateOne({ _id: new ObjectId(id) }, { $set: filtered });

  return result.modifiedCount > 0;
}

async function deleteUser(id) {
  const db = getDb();
  const result = await db
    .collection(COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });

  return result.deletedCount > 0;
}

async function comparePassword(plainText, hashed) {
  return await bcrypt.compare(plainText, hashed);
}

export {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  comparePassword,
};