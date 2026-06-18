const mongoose = require("mongoose");

const maskMongoUri = (uri) => {
  try {
    const parsed = new URL(uri);
    if (parsed.username || parsed.password) {
      parsed.username = parsed.username ? "***" : "";
      parsed.password = parsed.password ? "***" : "";
    }
    return parsed.toString();
  } catch (error) {
    return uri;
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in server/.env");
  }

  console.log(`Connecting to MongoDB: ${maskMongoUri(mongoUri)}`);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed.");
    if (error.message.includes("querySrv")) {
      console.error("Atlas SRV DNS lookup failed. Switching to a standard mongodb:// URI usually fixes this.");
    }
    console.error("Check that MONGO_URI is correct and that your Atlas network access list allows this machine.");
    throw error;
  }
};

module.exports = connectDB;
