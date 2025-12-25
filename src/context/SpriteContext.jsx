import React, { createContext, useContext, useState } from "react";

const SpriteContext = createContext(null);

export function SpriteProvider({ children }) {
  const [sprites, setSprites] = useState([]);

  const addSprite = (sprite) => {
    const newSprite = {
      id: sprite.id || `sprite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: sprite.name || "Sprite",
      render: sprite.render,
      x: sprite.x ?? 0,
      y: sprite.y ?? 0,
      direction: sprite.direction ?? 90,
      // Store actions in SpriteRunner format: [{ event: "play", actions: [...] }, { event: "click", actions: [...] }]
      actions: sprite.actions || [
        { event: "play", actions: [] },
        { event: "click", actions: [] },
      ],
      curentPos: {x: sprite.x ?? 0, y: sprite.y ?? 0, direction: sprite.direction ?? 90},
      currentEvent: null,
      modifiedActionIndex: -1,
      cooldown: 0,
    };
    setSprites((prev) => [...prev, newSprite]);
    return newSprite.id;
  };

  const deleteSprite = (spriteId) => {
    setSprites((prev) => prev.filter((sprite) => sprite.id !== spriteId));
  };

  const updateSprite = (spriteId, updates) => {
    setSprites((prev) =>
      prev.map((sprite) =>
        sprite.id === spriteId ? { ...sprite, ...updates } : sprite
      )
    );
  };

  const updateSpriteActions = (spriteId, actions) => {
    setSprites((prev) =>
      prev.map((sprite) =>
        sprite.id === spriteId ? { ...sprite, actions:[...actions] } : sprite
      )
    );
  };

  const updateSpriteCooldown = (spriteId, cooldown) => {
    setSprites((prev) =>
      prev.map((sprite) =>
        sprite.id === spriteId ? { ...sprite, cooldown } : sprite
      )
    );
  };

  const addActionToEvent = (spriteId, eventType, action) => {
    setSprites((prev) =>
      prev.map((sprite) => {
        if (sprite.id !== spriteId) return sprite;
        
        // Map eventType to SpriteRunner event format
        const event = eventType === 'playEvent' ? 'play' : 'click';
        
        // Update actions array in SpriteRunner format
        const updatedActions = (sprite.actions || []).map((eventAction) => {
          if (eventAction.event === event) {
            return {
              ...eventAction,
              actions: [...(eventAction.actions || []), action],
            };
          }
          return eventAction;
        });
        
        // If event doesn't exist, add it
        const eventExists = updatedActions.some((a) => a.event === event);
        if (!eventExists) {
          updatedActions.push({ event, actions: [action] });
        }
        
        return {
          ...sprite,
          actions: updatedActions,
        };
      })
    );
  };

  const removeActionFromEvent = (spriteId, eventType, actionIndex) => {
    setSprites((prev) =>
      prev.map((sprite) => {
        if (sprite.id !== spriteId) return sprite;
        
        // Map eventType to SpriteRunner event format
        const event = eventType === 'playEvent' ? 'play' : 'click';
        
        // Update actions array
        const updatedActions = (sprite.actions || []).map((eventAction) => {
          if (eventAction.event === event) {
            return {
              ...eventAction,
              actions: (eventAction.actions || []).filter((_, index) => index !== actionIndex),
            };
          }
          return eventAction;
        });
        
        return {
          ...sprite,
          actions: updatedActions,
        };
      })
    );
  };

  const updateActionInEvent = (spriteId, eventType, actionIndex, newPayload) => {
    setSprites((prev) =>
      prev.map((sprite) => {
        if (sprite.id !== spriteId) return sprite;
        
        // Map eventType to SpriteRunner event format
        const event = eventType === 'playEvent' ? 'play' : 'click';
        
        // Update actions array
        const updatedActions = (sprite.actions || []).map((eventAction) => {
          if (eventAction.event === event) {
            return {
              ...eventAction,
              actions: (eventAction.actions || []).map((action, index) => {
                if (index === actionIndex) {
                  return {
                    ...action,
                    payload: { ...action.payload, ...newPayload },
                  };
                }
                return action;
              }),
            };
          }
          return eventAction;
        });
        
        return {
          ...sprite,
          actions: updatedActions,
        };
      })
    );
  };

  const reorderActionInEvent = (spriteId, eventType, fromIndex, toIndex) => {
    setSprites((prev) =>
      prev.map((sprite) => {
        if (sprite.id !== spriteId) return sprite;
        
        // Map eventType to SpriteRunner event format
        const event = eventType === 'playEvent' ? 'play' : 'click';
        
        // Reorder actions array
        const updatedActions = (sprite.actions || []).map((eventAction) => {
          if (eventAction.event === event) {
            const actions = [...(eventAction.actions || [])];
            const [removed] = actions.splice(fromIndex, 1);
            actions.splice(toIndex, 0, removed);
            return {
              ...eventAction,
              actions,
            };
          }
          return eventAction;
        });
        
        return {
          ...sprite,
          actions: updatedActions,
        };
      })
    );
  };

  const getSprite = (spriteId) => {
    return sprites.find((sprite) => sprite.id === spriteId);
  };

  return (
    <SpriteContext.Provider
      value={{
        sprites,
        addSprite,
        deleteSprite,
        updateSprite,
        updateSpriteActions,
        updateSpriteCooldown,
        getSprite,
        addActionToEvent,
        removeActionFromEvent,
        updateActionInEvent,
        reorderActionInEvent,
      }}
    >
      {children}
    </SpriteContext.Provider>
  );
}

export function useSprites() {
  const context = useContext(SpriteContext);
  if (!context) {
    throw new Error("useSprites must be used within a SpriteProvider");
  }
  return context;
}

