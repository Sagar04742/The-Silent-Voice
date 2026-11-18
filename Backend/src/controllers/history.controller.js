import historyModel from "../model/history.model.js";

const toDto = (h) => ({
  id: h._id,
  gestureId: h.gestureId,
  gesture: h.gesture,
  translation: h.translation,
  language: h.language,
  createdAt: h.createdAt,
});

export async function listHistory(req, res) {
  const items = await historyModel.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(200);
  res.json({ items: items.map(toDto) });
}

export async function addHistory(req, res) {
  const { gestureId = "", gesture, translation, language = "en", createdAt } = req.body;
  if (!gesture || !translation) {
    return res.status(400).json({ message: "gesture and translation are required" });
  }
  const doc = await historyModel.create({
    user: req.user._id,
    gestureId: String(gestureId).slice(0, 40),
    gesture: String(gesture).slice(0, 100),
    translation: String(translation).slice(0, 300),
    language: String(language).slice(0, 8),
    ...(createdAt && !isNaN(new Date(createdAt)) ? { createdAt: new Date(createdAt) } : {}),
  });
  res.status(201).json({ item: toDto(doc) });
}

export async function deleteHistoryItem(req, res) {
  await historyModel.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ success: true });
}

export async function clearHistory(req, res) {
  await historyModel.deleteMany({ user: req.user._id });
  res.json({ success: true });
}
