const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "GoFastFamily",  // 👈 Custom DB name — totally valid
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected to GoFastFamily...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
