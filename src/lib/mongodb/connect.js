import mongoose from "mongoose";
import dns from "dns";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export default async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("[MongoDB] Connecting...");

    if (process.env.NODE_ENV !== "production") {
      dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
    }

    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;

    console.log("[MongoDB] Connected:", cached.conn.connection.host);

    return cached.conn;
  } catch (error) {
    cached.promise = null;

    console.error("[MongoDB] Connection failed:");
    console.error("Code:", error?.code);
    console.error("Message:", error?.message);

    if (error?.syscall === "queryTxt" && error?.code === "ESERVFAIL") {
      console.error(
        "Hint: DNS TXT/SRV lookup failed for mongodb+srv:// hostname. " +
        "Check: (1) run 'nslookup -type=TXT <hostname>' to test DNS, (2) flush DNS with 'ipconfig /flushdns', " +
        "(3) check VPN/network DNS settings (some block UDP:53), (4) switch to public DNS (8.8.8.8, 1.1.1.1)."
      );
    }

    throw error;
  }
}