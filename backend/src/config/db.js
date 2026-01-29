const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing from environment variables.");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });

  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
};

module.exports = connectDB;
