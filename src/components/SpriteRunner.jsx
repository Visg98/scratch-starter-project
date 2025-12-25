import React, { useEffect, useRef, useState } from "react";
import CatSprite from "./CatSprite";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runSpriteActions({ actions, onUpdate, initialState, shouldAbort, useInitialState = false, startIndex = 0, onIndexUpdate, onStateChange }) {
  // Maintain local state that updates synchronously as actions execute
  // Start from initialState if resetting, otherwise from the current state (initialState will be current state)
  let currentState = { ...initialState };
  let currentIndex = startIndex;
  
  const apply = (fn) => {
    // Update local state synchronously
    currentState = fn(currentState);
    // Update React state (may be async, but we use local state for calculations)
    onUpdate(() => currentState);
    // Also notify parent about state change for collision detection
    if (onStateChange) {
      onStateChange(currentState);
    }
  };

  const exec = async (list) => {
    for (let i = currentIndex; i < list.length; i++) {
      if (shouldAbort?.()) return;
      const step = list[i];
      if (!step) continue;
      const { type, payload = {} } = step;

      // Update current index before executing
      currentIndex = i;
      if (onIndexUpdate) {
        onIndexUpdate(i);
      }

      if (type === "move") {
        const steps = payload.steps ?? 0;
        // Calculate movement vector
        const directionInRad = (currentState.direction * Math.PI) / 180;
        const dx = Math.cos(directionInRad) * steps;
        const dy = Math.sin(directionInRad) * steps;
        
        // Break movement into smaller steps to check collisions during movement
        const numSteps = Math.max(1, Math.ceil(Math.abs(steps) / 10)); // Check every ~10 pixels
        const stepSize = 1 / numSteps;
        
        for (let i = 1; i <= numSteps; i++) {
          const progress = i * stepSize;
          apply((s) => ({
            ...s,
            x: s.x + dx * stepSize,
            y: s.y + dy * stepSize,
          }));
          // Small delay between intermediate steps for smoother animation and collision checking
          await sleep(300 / numSteps);
        }
      } else if (type === "turn") {
        const degrees = payload.degrees ?? 0;
        apply((s) => {
          // Normalize direction to 0-360 range, handling negative values
          let newDirection = (s.direction + degrees) % 360;
          if (newDirection < 0) {
            newDirection += 360;
          }
          return { ...s, direction: newDirection };
        });
        // Wait a bit for the transition to be visible
        await sleep(300);
      } else if (type === "goto") {
        const { x = 0, y = 0 } = payload;
        // Break goto into smaller steps to check collisions during movement
        const startX = currentState.x;
        const startY = currentState.y;
        const totalDx = x - startX;
        const totalDy = y - startY;
        const distance = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
        const numSteps = Math.max(1, Math.ceil(distance / 10)); // Check every ~10 pixels
        const stepSize = 1 / numSteps;
        
        for (let i = 1; i <= numSteps; i++) {
          const progress = i * stepSize;
          apply((s) => ({
            ...s,
            x: startX + totalDx * progress,
            y: startY + totalDy * progress,
          }));
          await sleep(300 / numSteps);
        }
      } else if (type === "repeat") {
        const count = payload.count ?? 1;
        for (let j = 0; j < count; j++) {
          await exec(payload.actions || []);
        }
      } else if (type === "say" || type === "think") {
        const { text = "", seconds = 1 } = payload;
        apply((s) => ({ ...s, bubble: { type, text } }));
        await sleep(seconds * 1000);
        apply((s) => ({ ...s, bubble: null }));
        // Wait a bit after clearing bubble
        await sleep(100);
      }
      if (shouldAbort?.()) return;
    }
  };

  await exec(actions || []);
}

export default function SpriteRunner({
  sprite,
  actions, // [{ event: "play" | "click", actions: [...] }]
  onEnd,
  playTrigger, // External trigger for play event - when changed, triggers play actions
  restartTrigger, // External trigger for restart - when changed, resets to initial state
  renderSprite = CatSprite,
  onStateUpdate, // Callback to report execution state (eventType, actionIndex, position)
}) {
  const RenderSprite = renderSprite;
  const initialSprite = useRef({
    x: sprite?.x ?? 0,
    y: sprite?.y ?? 0,
    direction: sprite?.direction ?? 90,
    bubble: null,
    name: sprite?.name ?? "Sprite",
  });
  const [state, setState] = useState(() => ({
    ...initialSprite.current,
  }));
  const runId = useRef(0);
  const currentEventType = useRef(null);
  const currentActionIndex = useRef(0);

  const playActions = actions?.find((a) => a.event === "play")?.actions || [];
  const clickActions = actions?.find((a) => a.event === "click")?.actions || [];

  // Track latest state in ref for synchronous access
  const latestStateRef = useRef(state);
  
  // Handler for state changes from runSpriteActions (called synchronously)
  const handleStateChange = (newState) => {
    latestStateRef.current = newState;
    if (onStateUpdate && currentEventType.current) {
      onStateUpdate({
        eventType: currentEventType.current,
        actionIndex: currentActionIndex.current,
        position: { x: newState.x, y: newState.y },
        state: newState,
      });
    }
  };
  
  // Wrapped setState to also report to parent for collision detection
  const setStateAndReport = (newState) => {
    let updatedState;
    setState((prevState) => {
      updatedState = typeof newState === 'function' ? newState(prevState) : newState;
      latestStateRef.current = updatedState;
      return updatedState;
    });
    
    // Report state update synchronously with the calculated new state
    if (onStateUpdate && currentEventType.current && updatedState) {
      onStateUpdate({
        eventType: currentEventType.current,
        actionIndex: currentActionIndex.current,
        position: { x: updatedState.x, y: updatedState.y },
        state: updatedState,
      });
    }
  };

  // Report state updates for collision detection (also on initial state changes)
  useEffect(() => {
    if (onStateUpdate && currentEventType.current) {
      onStateUpdate({
        eventType: currentEventType.current,
        actionIndex: currentActionIndex.current,
        position: { x: state.x, y: state.y },
        state: state,
      });
    }
  }, [state.x, state.y, currentActionIndex.current]);

  // Update initial sprite when sprite prop changes
  useEffect(() => {
    initialSprite.current = {
      x: sprite?.x ?? 0,
      y: sprite?.y ?? 0,
      direction: sprite?.direction ?? 90,
      bubble: null,
      name: sprite?.name ?? "Sprite",
    };
  }, [sprite?.x, sprite?.y, sprite?.direction, sprite?.name]);

  const runActions = async (actionList, { resetToInitial = false, eventType = null, startIndex = 0 } = {}) => {
    const currentRun = ++runId.current;
    
    if (eventType) {
      currentEventType.current = eventType;
    }
    currentActionIndex.current = startIndex;
    
    if (resetToInitial) {
      // Update initial sprite from current sprite prop before resetting
      initialSprite.current = {
        x: sprite?.x ?? 0,
        y: sprite?.y ?? 0,
        direction: sprite?.direction ?? 90,
        bubble: null,
        name: sprite?.name ?? "Sprite",
      };
      // Reset state to initial position
      setStateAndReport({ ...initialSprite.current });
      // Wait for state update to complete before running actions
      await new Promise(resolve => setTimeout(resolve, 0));
      currentActionIndex.current = 0;
    }
    
    // Use the initial sprite state when resetting, otherwise use current state
    const startingState = resetToInitial ? { ...initialSprite.current } : state;
    
    await runSpriteActions({
      actions: actionList,
      onUpdate: setStateAndReport,
      initialState: startingState,
      shouldAbort: () => runId.current !== currentRun,
      useInitialState: resetToInitial,
      startIndex: startIndex,
      onIndexUpdate: (index) => {
        currentActionIndex.current = index;
      },
      onStateChange: handleStateChange,
    });
    if (runId.current === currentRun) {
      onEnd && onEnd(state);
    }
  };

  // React to external play trigger (e.g., from a play button)
  useEffect(() => {
    if (playTrigger !== undefined && playTrigger > 0 && playActions.length > 0) {
      currentEventType.current = 'play';
      runActions(playActions, { resetToInitial: true, eventType: 'play', startIndex: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playTrigger]);

  // React to external restart trigger - reset to initial state without running actions
  useEffect(() => {
    if (restartTrigger !== undefined && restartTrigger > 0) {
      // Update initial sprite from current sprite prop
      initialSprite.current = {
        x: sprite?.x ?? 0,
        y: sprite?.y ?? 0,
        direction: sprite?.direction ?? 90,
        bubble: null,
        name: sprite?.name ?? "Sprite",
      };
      // Reset state to initial position
      setStateAndReport({ ...initialSprite.current });
      // Cancel any running actions
      runId.current++;
      currentEventType.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restartTrigger]);

  return (
    <div
      onClick={() => {
        if (clickActions.length > 0) {
          currentEventType.current = 'click';
          runActions(clickActions, { resetToInitial: false, eventType: 'click', startIndex: 0 });
        }
      }}
      style={{
        position: "absolute",
        width: 100,
        height: 100,
        transform: `translate(${state.x}px, ${state.y}px) rotate(${state.direction}deg)`,
        transition: "transform 100ms linear",
      }}
    >
      <RenderSprite />
      {state.bubble ? (
        <div
          style={{
            position: "absolute",
            top: -30,
            left: 0,
            padding: "4px 8px",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: 6,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            fontSize: 12,
          }}
        >
          {state.bubble.text}
        </div>
      ) : null}
    </div>
  );
}