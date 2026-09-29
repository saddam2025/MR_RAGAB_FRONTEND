// src/contexts/SelectedChildContext.jsx
import React, { createContext, useContext, useState } from 'react';

const SelectedChildContext = createContext(null);

export function SelectedChildProvider({ children, initialChildId = null }) {
  const [selectedChildId, setSelectedChildId] = useState(initialChildId);

  const value = {
    selectedChildId,
    setSelectedChildId,
  };

  return <SelectedChildContext.Provider value={value}>{children}</SelectedChildContext.Provider>;
}

export function useSelectedChild() {
  const ctx = useContext(SelectedChildContext);
  if (!ctx) {
    throw new Error('useSelectedChild must be used within SelectedChildProvider');
  }
  return ctx;
}
