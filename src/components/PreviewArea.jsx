import React, { useState, useEffect, useRef, useCallback } from "react";
import SpriteRunner from "./SpriteRunner";
import { SpriteAnimation } from "./spriteAnimation";
import { useSprites } from "../context/SpriteContext";
import { checkCollision } from "../utils/collisionDetection";

export default function PreviewArea() {
  const [playTrigger, setPlayTrigger] = useState(0);
  const [restartTrigger, setRestartTrigger] = useState(0);
  const { sprites } = useSprites();
  
  // Track execution state for each sprite
  const executionStates = useRef({});
  
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
  };

  // Check collisions between all sprites
  const checkCollisions = useCallback(() => {
    const spriteIds = Object.keys(executionStates.current);
    
    // Need at least 2 sprites to check collisions
    if (spriteIds.length < 2) return;
    
    for (let i = 0; i < spriteIds.length; i++) {
      for (let j = i + 1; j < spriteIds.length; j++) {
        const spriteId1 = spriteIds[i];
        const spriteId2 = spriteIds[j];
        const state1 = executionStates.current[spriteId1];
        const state2 = executionStates.current[spriteId2];
        
        if (state1?.position && state2?.position && state1.eventType && state2.eventType) {
          if (checkCollision(state1.position, state2.position)) {
            // Collision detected - handle as needed
          }
        }
      }
    }
  }, []); // No dependencies - uses refs for everything

  // Handle state updates from SpriteRunner
  const handleSpriteStateUpdate = useCallback((spriteId) => (stateUpdate) => {
    executionStates.current[spriteId] = {
      ...executionStates.current[spriteId],
      ...stateUpdate,
    };
  }, []);

  // Periodic collision check every 50ms
  useEffect(() => {
    let intervalId;
    
    // Only run collision checks when play is active (sprites are moving)
    if (playTrigger > 0) {
      intervalId = setInterval(() => {
        checkCollisions();
      }, 50); // Check every 50 milliseconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [playTrigger, checkCollisions]);

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
              renderSprite={sprite.render}
            />
          );
        })}
      </div>
    </div>
  );
}
