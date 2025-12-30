import React, { useState, useEffect, useRef, useCallback } from "react";
import { SpriteAnimation } from "./spriteAnimation";
import { useSprites } from "../context/SpriteContext";
import {checkCollision, clear} from "../utils/collisionDetection";

export default function PreviewArea() {
  const [playTrigger, setPlayTrigger] = useState(0);
  const [restartTrigger, setRestartTrigger] = useState(0);
  const { sprites, updateSpriteActions, getSprite, updateSpriteCooldown } = useSprites();
  // Track execution state for each sprite
  const executionStates = useRef({});
  const latestCheckRef = useRef(() => {});
  useEffect(() => {
    latestCheckRef.current = checkCollisions;
  });
  
  // Clear execution states when play starts
  useEffect(() => {
    if (playTrigger > 0) {
      executionStates.current = {};
    }
  }, [playTrigger]);

  const handlePlay = () => {
    setPlayTrigger((prev) => prev + 1);
  };

  const handleRestart = () => {
    setRestartTrigger((prev) => prev + 1);
    executionStates.current = {};
    clear();
  };

  // Check collisions between all sprites
  const checkCollisions = () => {
    for(let i = 0; i < sprites.length; i++) {
      for(let j = i + 1; j < sprites.length; j++) {
        const sprite1 = sprites[i];
        const sprite2 = sprites[j];
        if(checkCollision(sprite1, sprite2)) {
          // Collision detected - swap actions between sprites
          if (sprite1 && sprite2) {
            const sprite1Actions = sprite1.actions || [];
            const sprite2Actions = sprite2.actions || [];
            
            // Get active and inactive event types for each sprite
            const s1ActiveEvent = sprite1.currentEvent; // "play" or "click"
            const s2ActiveEvent = sprite2.currentEvent; // "play" or "click"
            
            // Get active and inactive event actions for sprite1
            const s1ActiveActions = sprite1Actions.find(a => a.event === s1ActiveEvent) || { event: s1ActiveEvent, actions: [] };
            const s1InactiveEvent = s1ActiveEvent === "play" ? "click" : "play";
            const s1InactiveActions = sprite1Actions.find(a => a.event === s1InactiveEvent) || { event: s1InactiveEvent, actions: [] };
            
            // Get active and inactive event actions for sprite2
            const s2ActiveActions = sprite2Actions.find(a => a.event === s2ActiveEvent) || { event: s2ActiveEvent, actions: [] };
            const s2InactiveEvent = s2ActiveEvent === "play" ? "click" : "play";
            const s2InactiveActions = sprite2Actions.find(a => a.event === s2InactiveEvent) || { event: s2InactiveEvent, actions: [] };
            
            // Swap active with active, inactive with inactive
            // Create new actions arrays with swapped actions
            const newSprite1Actions = [
              { ...s2ActiveActions, event: s1ActiveEvent }, // s1 gets s2's active actions as its active event
              { ...s2InactiveActions, event: s1InactiveEvent } // s1 gets s2's inactive actions as its inactive event
            ];
            
            const newSprite2Actions = [
              { ...s1ActiveActions, event: s2ActiveEvent }, // s2 gets s1's active actions as its active event
              { ...s1InactiveActions, event: s2InactiveEvent } // s2 gets s1's inactive actions as its inactive event
            ];
            
            // Update both sprites with swapped actions
            updateSpriteActions(sprite1.id, newSprite1Actions);
            updateSpriteActions(sprite2.id, newSprite2Actions);
          }
        }
      }
    }
  }

  // Periodic collision check every 50ms
  useEffect(() => {
    if (playTrigger <= 0) return;

    const id = setInterval(() => {
      latestCheckRef.current();
    }, 100);

    return () => clearInterval(id);
  }, [playTrigger]);

  return (
    <div className="flex-1 h-full overflow-y-auto p-2">
      <div className="mb-4 flex gap-2">
        <button
          onClick={handlePlay}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Play
        </button>
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Restart
        </button>
      </div>
      <div style={{ position: "relative", width: "100%", height: "90%" }}>
        {sprites.map((sprite) => {
          return (
            // <SpriteRunner
            //   key={sprite.id}
            //   sprite={{ x: sprite.x, y: sprite.y, direction: sprite.direction, name: sprite.name }}
            //   actions={sprite.actions || []}
            //   playTrigger={playTrigger}
            //   restartTrigger={restartTrigger}
            //   renderSprite={sprite.render}
            //   onStateUpdate={handleSpriteStateUpdate(sprite.id)}
            // />
            <SpriteAnimation
              key={sprite.id}
              spriteId={sprite.id}
              spriteActions={sprite.actions || []}
              startPos={{x: sprite.x, y: sprite.y, direction: sprite.direction}}
              playTrigger={playTrigger}
              restartTrigger={restartTrigger}
              renderSprite={sprite.render}
            />
          );
        })}
      </div>
    </div>
  );
}
