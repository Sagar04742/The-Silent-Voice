import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gesture: {
      type: String,
      required: true, // Fixed: 'require' changed to 'required'
    },
    translation: {
      type: String,
      required: true,
    },
  },
  { 
    timestamps: true // Added: Automatically adds createdAt and updatedAt dates
  }
);

// Fixed: mongoose.Model changed to mongoose.model
const historyModel = mongoose.model("History", historySchema);

export default historyModel;