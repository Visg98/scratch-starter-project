import React, { useState, useEffect, useRef } from "react";
import { useSprites } from "../context/SpriteContext";

export function SpriteAnimation({actions, startPos = {x: 0, y: 0, direction: 90}, playTrigger, spriteId, renderSprite: RenderSprite }) {
    const [state, setState] = useState({...startPos, bubble: null});
    const [currentEventType, setCurrentEventType] = useState(null);
    const [currentActionIndex, setCurrentActionIndex] = useState(-1);
    const { updateSprite } = useSprites();
    
    // Refs to store latest values for use in interval callback
    const stateRef = useRef({...startPos, bubble: null});
    const currentEventTypeRef = useRef(null);
    const currentActionIndexRef = useRef(-1);
    const actionsRef = useRef(actions);
    const startPosRef = useRef(startPos);
    
    // Update refs when state/props change
    useEffect(() => {
        stateRef.current = state;
    }, [state]);
    
    useEffect(() => {
        currentEventTypeRef.current = currentEventType;
    }, [currentEventType]);
    
    useEffect(() => {
        currentActionIndexRef.current = currentActionIndex;
    }, [currentActionIndex]);
    
    useEffect(() => {
        actionsRef.current = actions;
    }, [actions]);
    
    useEffect(() => {
        startPosRef.current = startPos;
    }, [startPos]);

    // Helper function to calculate new position based on direction and steps
    const calculateNewPosition = (currentX, currentY, direction, steps) => {
        const directionInRad = (direction * Math.PI) / 180;
        const dx = Math.cos(directionInRad) * steps;
        const dy = Math.sin(directionInRad) * steps;
        return {
            x: currentX + dx,
            y: currentY + dy,
            direction: direction
        };
    };

    // Function to process current action and update state
    const processCurrentAction = () => {
        const currentEvent = currentEventTypeRef.current;
        const currentIndex = currentActionIndexRef.current;
        const currentState = stateRef.current;
        
        // If no event type or invalid index, do nothing
        if (!currentEvent || currentIndex < 0) {
            return;
        }
        
        // Get actions for current event
        const eventActions = actionsRef.current?.find(a => a.event === currentEvent);
        if (!eventActions || !eventActions.actions) {
            return;
        }
        
        const actionList = eventActions.actions;
        
        // If index is out of bounds, do nothing
        if (currentIndex >= actionList.length) {
            return;
        }
        
        const currentAction = actionList[currentIndex];
        if (!currentAction) {
            return;
        }
        
        let newState = { ...currentState };
        
        // Process action based on type
        if (currentAction.type === "move") {
            const steps = currentAction.payload?.steps ?? 0;
            const newPos = calculateNewPosition(
                currentState.x, 
                currentState.y, 
                currentState.direction, 
                steps
            );
            newState = { ...newPos, bubble: currentState.bubble };
        } else if (currentAction.type === "turn") {
            const degrees = currentAction.payload?.degrees ?? 0;
            let newDirection = (currentState.direction + degrees) % 360;
            if (newDirection < 0) {
                newDirection += 360;
            }
            newState = { ...currentState, direction: newDirection };
        } else if (currentAction.type === "goto") {
            const { x = 0, y = 0 } = currentAction.payload || {};
            newState = { ...currentState, x, y };
        } else if (currentAction.type === "say" || currentAction.type === "think") {
            const { text = "" } = currentAction.payload || {};
            newState = { ...currentState, bubble: { type: currentAction.type, text } };
        }
        
        // Update state
        setState(newState);
        stateRef.current = newState;
        
        // Advance to next action
        const nextIndex = currentIndex + 1;
        setCurrentActionIndex(nextIndex);
        currentActionIndexRef.current = nextIndex;
        
        // Update sprite in context
        if (spriteId) {
            updateSprite(spriteId, {
                curentPos: { x: newState.x, y: newState.y, direction: newState.direction },
                currentEvent: currentEvent,
                actionIndex: nextIndex
            });
        }
    };

    // Execute the first action when play is triggered
    useEffect(() => {
        if(playTrigger) {
            // Reset to start position
            const resetState = {...startPosRef.current, bubble: null};
            setState(resetState);
            stateRef.current = resetState;
            
            setCurrentEventType('play');
            currentEventTypeRef.current = 'play';
            setCurrentActionIndex(0);
            currentActionIndexRef.current = 0;
            
            // Update sprite in context
            if (spriteId) {
                updateSprite(spriteId, {
                    curentPos: { x: startPosRef.current.x, y: startPosRef.current.y, direction: startPosRef.current.direction },
                    currentEvent: 'play',
                    actionIndex: 0
                });
            }
        }
    }, [playTrigger]);

    // Call processCurrentAction every 50ms
    useEffect(() => {
        const intervalId = setInterval(() => {
            processCurrentAction();
        }, 50);
        
        return () => {
            clearInterval(intervalId);
        };
    }, []);
    
    return (
        <div
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            top: state.y,
            left: state.x,
          }}
        >
          {RenderSprite ? <RenderSprite /> : <div>No sprite render component</div>}
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
