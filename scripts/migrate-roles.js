// One-off migration: role (scalar) -> roles (array). Run once per environment
// (dev / preview / prod use separate MongoDB clusters per CLAUDE.md — run this
// once against each, pointed at the correct MONGODB_URI).
//
// Usage: MONGODB_URI="mongodb+srv://..." node scripts/migrate-roles.js
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const dns = require("dns");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const users = db.collection("users");

  // 1. Migrate every doc that still has the old scalar `role` field.
  const cursor = users.find({ role: { $exists: true } });
  let migrated = 0;
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    await users.updateOne(
      { _id: doc._id },
      { $set: { roles: [doc.role] }, $unset: { role: "" } }
    );
    migrated++;
  }
  console.log(`Migrated ${migrated} user document(s) from role -> roles.`);

  // 2. Safety net: any doc with neither `role` nor `roles` gets the default.
  const backfilled = await users.updateMany(
    { roles: { $exists: false } },
    { $set: { roles: ["user"] } }
  );
  console.log(`Backfilled ${backfilled.modifiedCount} document(s) with default roles: ["user"].`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("[migrate-roles] Failed:", err);

  if ((err?.code === "ESERVFAIL" || err?.code === "ENOTFOUND") && (err?.syscall === "queryTxt" || err?.syscall === "querySrv")) {
    console.error(
      "Hint: DNS TXT/SRV lookup failed for mongodb+srv:// hostname. " +
      "Check: (1) run 'nslookup -type=TXT <hostname>' to test DNS, (2) flush DNS with 'ipconfig /flushdns', " +
      "(3) check VPN/network DNS settings (some block UDP:53), (4) switch to public DNS (8.8.8.8, 1.1.1.1)."
    );
  }

  process.exit(1);
});
