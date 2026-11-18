import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    gestureId: { type: String, default: "" }, // stable id, e.g. "open_palm"
    gesture: { type: String, required: true }, // human label at the time
    translation: { type: String, required: true }, // sentence that was spoken
    language: { type: String, default: "en" },
  },
  { timestamps: true },
);

const historyModel = mongoose.model("History", historySchema);
export default historyModel;
