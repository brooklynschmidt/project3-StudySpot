import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connect, disconnect, getDb } from "../db/connection.js";

dotenv.config();

const FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
  "Isabella", "James", "Mia", "Lucas", "Charlotte", "Aiden", "Amelia",
  "Harper", "Elijah", "Evelyn", "Logan", "Abigail", "Alex", "Ella",
  "Jack", "Grace", "Ryan", "Chloe", "Daniel", "Lily", "Henry", "Zoe",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Clark", "Lewis",
  "Robinson", "Walker", "Young",
];

const CATEGORIES = ["Library", "Cafe", "Academic", "Student center", "Residence"];
const NOISE_LEVELS = ["Quiet", "Moderate", "Loud"];
const AVAILABILITY = ["Not crowded", "Moderate", "Crowded"];
const GROUP_FRIENDLY = ["Yes", "No"];

const SPOT_TEMPLATES = [
  { prefix: "Snell Library", base: [42.3386, -71.0877] },
  { prefix: "Curry Student Center", base: [42.3391, -71.0874] },
  { prefix: "Hayden Hall", base: [42.3383, -71.0862] },
  { prefix: "International Village", base: [42.3407, -71.0890] },
  { prefix: "Shillman Hall", base: [42.3375, -71.0892] },
  { prefix: "Behrakis Health Sciences", base: [42.3367, -71.0918] },
  { prefix: "Forsyth Building", base: [42.3365, -71.0895] },
  { prefix: "Ryder Hall", base: [42.3390, -71.0878] },
  { prefix: "Churchill Hall", base: [42.3378, -71.0908] },
  { prefix: "Egan Research Center", base: [42.3400, -71.0898] },
  { prefix: "Richards Hall", base: [42.3372, -71.0885] },
  { prefix: "Mugar Life Sciences", base: [42.3395, -71.0905] },
  { prefix: "West Village F", base: [42.3370, -71.0925] },
  { prefix: "West Village G", base: [42.3368, -71.0920] },
  { prefix: "West Village H", base: [42.3370, -71.0915] },
  { prefix: "Caffè Bene", base: [42.3427, -71.0855] },
  { prefix: "Wishing Cup", base: [42.3586, -71.0590] },
  { prefix: "Jaho Coffee Back Bay", base: [42.3480, -71.0776] },
  { prefix: "Jaho Coffee Chinatown", base: [42.3516, -71.0626] },
  { prefix: "Jaho Coffee South End", base: [42.3367, -71.0745] },
  { prefix: "Caffè Nero Copley", base: [42.3474, -71.0799] },
  { prefix: "Caffè Nero South End", base: [42.3446, -71.0710] },
  { prefix: "Boston Public Library", base: [42.3494, -71.0784] },
  { prefix: "Capital One Cafe", base: [42.3490, -71.0765] },
  { prefix: "Blank Street Boylston", base: [42.3494, -71.0748] },
  { prefix: "Tatte Bakery", base: [42.3472, -71.0802] },
  { prefix: "Pavement Coffeehouse", base: [42.3465, -71.0768] },
  { prefix: "Thinking Cup", base: [42.3525, -71.0635] },
  { prefix: "Render Coffee", base: [42.3505, -71.0698] },
  { prefix: "Trident Booksellers", base: [42.3490, -71.0825] },
];

const DESCRIPTIONS = [
  "Great spot with plenty of natural light and comfortable seating.",
  "Quiet environment perfect for focused study sessions.",
  "Popular with students, can get busy during peak hours.",
  "Hidden gem with fast wifi and lots of outlets.",
  "Spacious study area with both individual and group tables.",
  "Nice atmosphere, good coffee, and reasonable noise level.",
  "Reliable spot for late-night study sessions.",
  "Recently renovated with modern furniture and better lighting.",
  "Good for group projects, has bookable meeting rooms.",
  "Cozy spot, limited seating but worth the wait.",
  "Open late, great for cramming before exams.",
  "Beautiful space with high ceilings and large windows.",
  "Affordable food and drinks while you study.",
  "Well-maintained, clean restrooms, and friendly staff.",
  "Close to campus with easy T access.",
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomOffset() {
  return (Math.random() - 0.5) * 0.004;
}

function randomHours() {
  const openHour = Math.floor(Math.random() * 4) + 6;
  const closeHour = Math.floor(Math.random() * 5) + 18;
  const format = (h) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const hr = h > 12 ? h - 12 : h;
    return `${hr}:00 ${ampm}`;
  };
  return `${format(openHour)} - ${format(closeHour)}`;
}

async function seed() {
  await connect(process.env.MONGO_URI);
  const db = getDb();

  console.log("Clearing existing data...");
  await db.collection("users").deleteMany({});
  await db.collection("spots").deleteMany({});

  console.log("Seeding users...");
  const hashedPassword = await bcrypt.hash("studyspot", 10);
  const users = [];

  const mainUser = {
    email: "yeow.i@northeastern.edu",
    password: hashedPassword,
    firstName: "Isabel",
    lastName: "Yeow",
    initials: "IY",
    preferences: {
      noise: "Quiet",
      group: "Solo study",
      category: "Library",
    },
    createdAt: new Date(),
  };
  users.push(mainUser);

  const brooklynUser = {
    email: "schmidt.b@northeastern.edu",
    password: hashedPassword,
    firstName: "Brooklyn",
    lastName: "Schmidt",
    initials: "BS",
    preferences: {
      noise: "Moderate",
      group: "Group study",
      category: "Cafe",
    },
    createdAt: new Date(),
  };
  users.push(brooklynUser);

  for (let i = 0; i < 48; i++) {
    const first = randomItem(FIRST_NAMES);
    const last = randomItem(LAST_NAMES);
    users.push({
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@northeastern.edu`,
      password: hashedPassword,
      firstName: first,
      lastName: last,
      initials: (first.charAt(0) + last.charAt(0)).toUpperCase(),
      preferences: {
        noise: randomItem(NOISE_LEVELS),
        group: Math.random() > 0.5 ? "Group study" : "Solo study",
        category: randomItem(CATEGORIES),
      },
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    });
  }

  const userResult = await db.collection("users").insertMany(users);
  const userIds = Object.values(userResult.insertedIds).map((id) =>
    id.toString(),
  );
  console.log(`  Inserted ${users.length} users`);

  console.log("Seeding spots...");
  const spots = [];

  for (let i = 0; i < 1050; i++) {
    const template = randomItem(SPOT_TEMPLATES);
    const suffix = i < 30 ? "" : ` - ${Math.floor(Math.random() * 300) + 1}`;
    spots.push({
      name: `${template.prefix}${suffix}`,
      address: `${Math.floor(Math.random() * 900) + 100} Huntington Ave`,
      pos: [
        template.base[0] + randomOffset(),
        template.base[1] + randomOffset(),
      ],
      status: randomItem(AVAILABILITY),
      category: randomItem(CATEGORIES),
      noiseLevel: randomItem(NOISE_LEVELS),
      groupFriendly: randomItem(GROUP_FRIENDLY),
      hours: randomHours(),
      description: randomItem(DESCRIPTIONS),
      studentsNow: Math.floor(Math.random() * 150),
      createdBy: randomItem(userIds),
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    });
  }

  await db.collection("spots").insertMany(spots);
  console.log(`  Inserted ${spots.length} spots`);

  const spotCount = await db.collection("spots").countDocuments();
  const userCount = await db.collection("users").countDocuments();
  console.log(`\nDone! Database has ${userCount} users and ${spotCount} spots.`);

  await disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});