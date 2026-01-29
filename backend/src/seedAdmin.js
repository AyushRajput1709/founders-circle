require("dotenv").config();

const connectDB = require("./config/db");
const User = require("./models/User");

const seedAdmin = async () => {
  const adminUser = {
    name: "Admin",
    email: "admin@founders-circle.com",
    password: "admin123",
    role: "admin",
    company: "Founders Circle",
    verified: true,
  };

  // Check if admin already exists
  const existingAdmin = await User.findOne({ email: adminUser.email });
  if (existingAdmin) {
    console.log("Admin user already exists");
    return;
  }

  await User.create(adminUser);
  console.log("Admin user created successfully");
};

const run = async () => {
  try {
    await connectDB();
    await seedAdmin();
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Seed failed", error);
    process.exit(1);
  }
};

run();
