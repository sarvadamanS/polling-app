/**
 * seed.js — populates the database with:
 *   • 1 admin user  (admin / admin123)
 *   • 5 election nominees
 *
 * Run: node prisma/seed.js
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Default nominees for the election
const NOMINEES = [
  {
    name: "Alexandra Rivera",
    party: "Progressive Alliance",
    bio: "Former city mayor with 12 years of public service focused on infrastructure.",
    color: "#6366f1",
  },
  {
    name: "Marcus Chen",
    party: "Liberty Party",
    bio: "Tech entrepreneur turned politician, champion of digital rights.",
    color: "#f59e0b",
  },
  {
    name: "Priya Sharma",
    party: "Green Future",
    bio: "Environmental scientist advocating for sustainable energy policies.",
    color: "#10b981",
  },
  {
    name: "James O'Brien",
    party: "National Unity",
    bio: "Retired military general focused on veterans' welfare and national security.",
    color: "#ef4444",
  },
  {
    name: "Sofia Nakamura",
    party: "Citizens First",
    bio: "Community organizer with a decade of grassroots healthcare reform work.",
    color: "#8b5cf6",
  },
];

async function main() {
  console.log("🌱  Seeding database…");

  // Upsert admin — idempotent so re-running seed is safe
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: hashedPassword },
  });
  console.log("✅  Admin created — username: admin | password: admin123");

  // Upsert nominees — skip if they already exist (idempotent)
  for (const nominee of NOMINEES) {
    await prisma.nominee.upsert({
      where: { id: NOMINEES.indexOf(nominee) + 1 },
      update: {},
      create: nominee,
    });
  }
  console.log(`✅  ${NOMINEES.length} nominees seeded`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());