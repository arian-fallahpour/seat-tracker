import { useState } from "react";

export function useCatalog(defaultSessions) {
  const [selectedSessions, setSelectedSessions] = useState(defaultSessions || []);

  const toggleSessionHandler = (id) => {
    if (selectedSessions.includes(id)) {
      setSelectedSessions((prev) => prev.filter((s) => s !== id));
    } else {
      setSelectedSessions((prev) => [...prev, id]);
    }
  };

  return {
    selectedSessions,
    toggleSession: toggleSessionHandler,
  };
}
