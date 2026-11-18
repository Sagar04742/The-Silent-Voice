import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  listHistory,
  addHistory,
  deleteHistoryItem,
  clearHistory,
} from "../controllers/history.controller.js";

const router = express.Router();
router.use(requireAuth);
router.get("/", listHistory);
router.post("/", addHistory);
router.delete("/", clearHistory);
router.delete("/:id", deleteHistoryItem);

export default router;
