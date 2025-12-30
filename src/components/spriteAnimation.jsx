import React, { useState, useEffect, useRef } from "react";
import { useSprites } from "../context/SpriteContext";

export function SpriteAnimation({spriteActions, startPos = {x: 0, y: 0, direction: 90}, playTrigger, restartTrigger, spriteId, renderSprite: RenderSprite }) {
    const [actions, setActions] = useState([]);
    useEffect(() => {
        if (!spriteActions || spriteActions.length === 0) {
            setActions([]);
            return;
        }
        
        const processedActions = spriteActions.map(eventAction => {
            const processedEventActions = [];
            
            eventAction.actions?.forEach(action => {
                if (action.type === "repeat") {
                    const count = action.payload?.count || 1;
                    const nestedActions = action.payload?.actions || [];
                    
                    for (let i = 0; i < count; i++) {
                        nestedActions.forEach(nestedAction => {
                            if (nestedAction.type === "move") {
                                const steps = nestedAction.payload?.steps ?? 0;
                                const absSteps = Math.abs(steps);
                                const sign = steps < 0 ? -1 : 1;
                                
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
                                processedEventActions.push(nestedAction);
                            }
                        });
                    }
                } else if (action.type === "move") {
                    const steps = action.payload?.steps ?? 0;
                    const absSteps = Math.abs(steps);
                    const sign = steps < 0 ? -1 : 1;
                    
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
    
    const stateRef = useRef({...startPos, bubble: null});
    const currentEventTypeRef = useRef(null);
    const currentActionIndexRef = useRef(-1);
    const actionsRef = useRef(actions);
    const startPosRef = useRef(startPos);
    const bubbleTimeoutRef = useRef(null);
    
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

    const processCurrentAction = () => {
        const currentEvent = currentEventTypeRef.current;
        const currentIndex = currentActionIndexRef.current;
        const currentState = stateRef.current;
        
        if (!currentEvent || currentIndex < 0) {
            return;
        }
        
        const eventActions = actionsRef.current?.find(a => a.event === currentEvent);
        if (!eventActions || !eventActions.actions) {
            return;
        }
        
        const actionList = eventActions.actions;
        
        if (currentIndex >= actionList.length) {
            return;
        }
        
        const currentAction = actionList[currentIndex];
        if (!currentAction) {
            return;
        }
        
        let newState = { ...currentState };
        
        if (currentAction.type === "move") {
            const steps = currentAction.payload?.steps ?? 0;
            const newPos = calculateNewPosition(
                currentState.x, 
                currentState.y, 
                currentState.direction, 
                steps
            );
            newState = { ...newPos, bubble: currentState.bubble };
            
            setState(newState);
            stateRef.current = newState;
            
            const nextIndex = currentIndex + 1;
            setCurrentActionIndex(nextIndex);
            currentActionIndexRef.current = nextIndex;
            
            if (spriteId) {
                updateSprite(spriteId, {
                    curentPos: { x: newState.x, y: newState.y, direction: newState.direction },
                    currentEvent: currentEvent,
                    modifiedActionIndex: nextIndex
                });
            }
        } else if (currentAction.type === "turn") {
            const degrees = currentAction.payload?.degrees ?? 0;
            let newDirection = (currentState.direction + degrees) % 360;
            if (newDirection < 0) {
                newDirection += 360;
            }
            newState = { ...currentState, direction: newDirection };
            
            setState(newState);
            stateRef.current = newState;
            
            const nextIndex = currentIndex + 1;
            setCurrentActionIndex(nextIndex);
            currentActionIndexRef.current = nextIndex;
            
            if (spriteId) {
                updateSprite(spriteId, {
                    curentPos: { x: newState.x, y: newState.y, direction: newState.direction },
                    currentEvent: currentEvent,
                    modifiedActionIndex: nextIndex
                });
            }
        } else if (currentAction.type === "goto") {
            const { x = 0, y = 0 } = currentAction.payload || {};
            newState = { ...currentState, x, y };
            
            setState(newState);
            stateRef.current = newState;
            
            const nextIndex = currentIndex + 1;
            setCurrentActionIndex(nextIndex);
            currentActionIndexRef.current = nextIndex;
            
            if (spriteId) {
                updateSprite(spriteId, {
                    curentPos: { x: newState.x, y: newState.y, direction: newState.direction },
                    currentEvent: currentEvent,
                    modifiedActionIndex: nextIndex
                });
            }
        } else if (currentAction.type === "say" || currentAction.type === "think") {
            const { text = "", seconds = 2 } = currentAction.payload || {};
            newState = { ...currentState, bubble: { type: currentAction.type, text } };
            
            setState(newState);
            stateRef.current = newState;
            
            if (bubbleTimeoutRef.current) {
                clearTimeout(bubbleTimeoutRef.current);
            }
            
            bubbleTimeoutRef.current = setTimeout(() => {
                setState((prev) => {
                    const clearedState = { ...prev, bubble: null };
                    stateRef.current = clearedState;
                    return clearedState;
                });
            }, seconds * 1000);
            
            const nextIndex = currentIndex + 1;
            setCurrentActionIndex(nextIndex);
            currentActionIndexRef.current = nextIndex;
            
            if (spriteId) {
                updateSprite(spriteId, {
                    curentPos: { x: newState.x, y: newState.y, direction: newState.direction },
                    currentEvent: currentEvent,
                    modifiedActionIndex: nextIndex
                });
            }
        }
    };

    useEffect(() => {
        if(playTrigger) {
            if (bubbleTimeoutRef.current) {
                clearTimeout(bubbleTimeoutRef.current);
                bubbleTimeoutRef.current = null;
            }
            
            const resetState = {...stateRef.current, bubble: null};
            setState(resetState);
            stateRef.current = resetState;
            
            setCurrentEventType('play');
            currentEventTypeRef.current = 'play';
            setCurrentActionIndex(0);
            currentActionIndexRef.current = 0;
            
            if (spriteId) {
                updateSprite(spriteId, {
                    curentPos: { x: startPosRef.current.x, y: startPosRef.current.y, direction: startPosRef.current.direction },
                    currentEvent: 'play',
                    modifiedActionIndex: 0
                });
            }
        }
    }, [playTrigger]);

    useEffect(() => {
        if (restartTrigger !== undefined && restartTrigger > 0) {
            if (bubbleTimeoutRef.current) {
                clearTimeout(bubbleTimeoutRef.current);
                bubbleTimeoutRef.current = null;
            }
            
            const resetState = {...startPosRef.current, bubble: null};
            setState(resetState);
            stateRef.current = resetState;
            
            setCurrentEventType(null);
            currentEventTypeRef.current = null;
            setCurrentActionIndex(-1);
            currentActionIndexRef.current = -1;
            
            if (spriteId) {
                updateSprite(spriteId, {
                    curentPos: { x: startPosRef.current.x, y: startPosRef.current.y, direction: startPosRef.current.direction },
                    currentEvent: null,
                    modifiedActionIndex: -1
                });
            }
        }
    }, [restartTrigger]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            processCurrentAction();
        }, 50);
        
        return () => {
            clearInterval(intervalId);
            if (bubbleTimeoutRef.current) {
                clearTimeout(bubbleTimeoutRef.current);
            }
        };
    }, []);
    
    const handleSpriteClick = () => {
        const clickActions = actionsRef.current?.find(a => a.event === 'click');
        if (clickActions && clickActions.actions && clickActions.actions.length > 0) {
            setCurrentEventType('click');
            currentEventTypeRef.current = 'click';
            setCurrentActionIndex(0);
            currentActionIndexRef.current = 0;
            
            if (spriteId) {
                updateSprite(spriteId, {
                    currentEvent: 'click',
                    modifiedActionIndex: 0
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
