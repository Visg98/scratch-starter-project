import React, { createContext, useContext, useState } from "react";

const SelectedSpriteContext = createContext(null);

export function SelectedSpriteProvider({ children }) {
  const [selectedSpriteIndex, setSelectedSpriteIndex] = useState(0);

  return (
    <SelectedSpriteContext.Provider
      value={{
        selectedSpriteIndex,
        setSelectedSpriteIndex,
      }}
    >
      {children}
    </SelectedSpriteContext.Provider>
  );
}

export function useSelectedSprite() {
  const context = useContext(SelectedSpriteContext);
  if (!context) {
    throw new Error("useSelectedSprite must be used within a SelectedSpriteProvider");
  }
  return context;
}

