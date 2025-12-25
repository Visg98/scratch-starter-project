import React, { useState, useEffect, useRef } from "react";
import { useSprites } from "../context/SpriteContext";

export function SpriteAnimation({spriteActions, startPos = {x: 0, y: 0, direction: 90}, playTrigger, spriteId, renderSprite: RenderSprite }) {
    const [actions, setActions] = useState([]);
    useEffect(() => {
        // Convert spriteActions and split move actions into increments of 10 or less
        if (!spriteActions || spriteActions.length === 0) {
            setActions([]);
            return;
        }
        
        const processedActions = spriteActions.map(eventAction => {
            const processedEventActions = [];
            
            eventAction.actions?.forEach(action => {
                if (action.type === "move") {
                    const steps = action.payload?.steps ?? 0;
                    const absSteps = Math.abs(steps);
                    const sign = steps < 0 ? -1 : 1;
                    
                    // Split into increments of 10 or less
                    let remainingSteps = absSteps;
                    while (remainingSteps > 0) {
                        const stepIncrement = Math.min(10, remainingSteps);
                        processedEventActions.push({
                            type: "move",
                            payload: {
                                steps: sign * stepIncrement
                            }
                        });
                        remainingSteps -= stepIncrement;
                    }
                } else {
                    // Keep all other actions as is
                    processedEventActions.push(action);
                }
            });
            
            return {
                event: eventAction.event,
                actions: processedEventActions
            };
        });
        setActions(processedActions);
    }, [spriteActions]);
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
    const bubbleTimeoutRef = useRef(null);
    
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
                    currentEvent: currentEvent
                });
            }
        } else if (currentAction.type === "turn") {
            const degrees = currentAction.payload?.degrees ?? 0;
            let newDirection = (currentState.direction + degrees) % 360;
            if (newDirection < 0) {
                newDirection += 360;
            }
            newState = { ...currentState, direction: newDirection };
            
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
                    currentEvent: currentEvent
                });
            }
        } else if (currentAction.type === "goto") {
            const { x = 0, y = 0 } = currentAction.payload || {};
            newState = { ...currentState, x, y };
            
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
                    currentEvent: currentEvent
                });
            }
        } else if (currentAction.type === "say" || currentAction.type === "think") {
            const { text = "", seconds = 2 } = currentAction.payload || {};
            newState = { ...currentState, bubble: { type: currentAction.type, text } };
            
            // Update state with bubble
            setState(newState);
            stateRef.current = newState;
            
            // Clear any existing timeout
            if (bubbleTimeoutRef.current) {
                clearTimeout(bubbleTimeoutRef.current);
            }
            
            // Set timeout to clear bubble after specified duration
            bubbleTimeoutRef.current = setTimeout(() => {
                // Clear bubble
                setState((prev) => {
                    const clearedState = { ...prev, bubble: null };
                    stateRef.current = clearedState;
                    return clearedState;
                });
            }, seconds * 1000);
            
            // Advance to next action immediately
            const nextIndex = currentIndex + 1;
            setCurrentActionIndex(nextIndex);
            currentActionIndexRef.current = nextIndex;
            
            // Update sprite in context
            if (spriteId) {
                updateSprite(spriteId, {
                    curentPos: { x: newState.x, y: newState.y, direction: newState.direction },
                    currentEvent: currentEvent
                });
            }
        }
    };

    // Execute the first action when play is triggered
    useEffect(() => {
        if(playTrigger) {
            // Clear any existing bubble timeout
            if (bubbleTimeoutRef.current) {
                clearTimeout(bubbleTimeoutRef.current);
                bubbleTimeoutRef.current = null;
            }
            
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
                    currentEvent: 'play'
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
            // Clear bubble timeout on cleanup
            if (bubbleTimeoutRef.current) {
                clearTimeout(bubbleTimeoutRef.current);
            }
        };
    }, []);
    
    // Handle click on sprite
    const handleSpriteClick = () => {
        // Check if click actions exist
        const clickActions = actionsRef.current?.find(a => a.event === 'click');
        if (clickActions && clickActions.actions && clickActions.actions.length > 0) {
            // Switch to click event and reset action index
            setCurrentEventType('click');
            currentEventTypeRef.current = 'click';
            setCurrentActionIndex(0);
            currentActionIndexRef.current = 0;
            
            // Update sprite in context
            if (spriteId) {
                updateSprite(spriteId, {
                    currentEvent: 'click'
                });
            }
        }
    };
    
    
    return (
        <div
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            top: state.y,
            left: state.x,
            cursor: "pointer",
            transform: `rotate(${state.direction}deg)`,
            transformOrigin: "center center",
          }}
          onClick={handleSpriteClick}
        >
          {RenderSprite ? <RenderSprite /> : <div>No sprite render component</div>}
          {state.bubble ? (
            <div
              style={{
                position: "absolute",
                top: -30,
                left: 0,
                padding: state.bubble.type === "think" ? "12px" : "4px 8px",
                background: "white",
                border: "1px solid #ddd",
                borderRadius: state.bubble.type === "think" ? "50%" : 6,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                fontSize: 12,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: state.bubble.type === "think" ? "50px" : "auto",
                minHeight: state.bubble.type === "think" ? "50px" : "auto",
                aspectRatio: state.bubble.type === "think" ? "1" : "auto",
                maxWidth: state.bubble.type === "think" ? "150px" : "200px",
                wordWrap: "break-word",
                textAlign: "center",
              }}
            >
              {state.bubble.text}
            </div>
          ) : null}
        </div>
      );
}
