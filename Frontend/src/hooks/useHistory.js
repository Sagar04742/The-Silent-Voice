import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";

// Translation history, stored per account in MongoDB through the API.
// Each entry keeps the stable sign id so it can be re-displayed in ANY language.
// Adds are optimistic: the item shows instantly and is swapped for the saved record.

export function useHistory(user) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    let cancelled = false;
    api("/history")
      .then((d) => !cancelled && setItems(d.items))
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [user]);

  const add = useCallback((entry) => {
    const local = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    };
    setItems((prev) => [local, ...prev].slice(0, 200));
    api("/history", { method: "POST", body: { ...entry, createdAt: local.createdAt } })
      .then((d) => setItems((prev) => prev.map((i) => (i.id === local.id ? d.item : i))))
      .catch(() => {}); // stays visible locally; sync is best-effort
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (!String(id).startsWith("local-")) api(`/history/${id}`, { method: "DELETE" }).catch(() => {});
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    api("/history", { method: "DELETE" }).catch(() => {});
  }, []);

  return { items, add, remove, clear };
}
