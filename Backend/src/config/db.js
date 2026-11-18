import mongoose from "mongoose";

async function connectToDb() {
  if (mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
  } catch (err) {
    // Keep the API alive so guest mode (no accounts) still works in the UI.
    console.error("Error while connecting to DB:", err.message);
  }
}

export default connectToDb;
