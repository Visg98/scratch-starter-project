import React, { useState } from "react";
import Icon from "./Icon";
import { useSprites } from "../context/SpriteContext";
import { useSelectedSprite } from "../context/SelectedSpriteContext";

export default function MidArea() {
  const { sprites, addActionToEvent, removeActionFromEvent, updateActionInEvent, reorderActionInEvent } = useSprites();
  const { selectedSpriteIndex } = useSelectedSprite();
  const [draggedOver, setDraggedOver] = useState(null);
  const [draggedActionIndex, setDraggedActionIndex] = useState(null);
  const [draggedActionEventType, setDraggedActionEventType] = useState(null);
  const [draggedOverRepeat, setDraggedOverRepeat] = useState(null); // {eventType, actionIndex}

  // Check if there are no sprites
  if (sprites.length === 0) {
    return (
      <div className="flex-1 h-full overflow-auto flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No sprites yet</p>
          <p className="text-sm">Create a sprite to get started</p>
        </div>
      </div>
    );
  }

  // Check if there's no valid selected sprite
  const hasValidSelection = selectedSpriteIndex !== null && 
                            selectedSpriteIndex >= 0 && 
                            selectedSpriteIndex < sprites.length;

  if (!hasValidSelection) {
    return (
      <div className="flex-1 h-full overflow-auto flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No sprite selected</p>
          <p className="text-sm">Select a sprite from the sidebar to add actions</p>
        </div>
      </div>
    );
  }

  const selectedSprite = sprites[selectedSpriteIndex];
  // Get actions from SpriteRunner format
  const playEventActions = selectedSprite.actions?.find((a) => a.event === 'play')?.actions || [];
  const clickEventActions = selectedSprite.actions?.find((a) => a.event === 'click')?.actions || [];

  const handleDragOver = (e, eventType) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(eventType);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(null);
  };

  const handleDrop = (e, eventType, repeatActionIndex = null) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(null);
    setDraggedOverRepeat(null);

    const actionType = e.dataTransfer.getData('actionType');
    const actionLabel = e.dataTransfer.getData('actionLabel');

    if (actionType && actionLabel && selectedSprite) {
      // Store in SpriteRunner format: { type, payload }
      let action = {};
      
      if (actionType === "move") {
        action = {
          type: "move",
          payload: { steps: 10 },
        };
      } else if (actionType === "turnLeft") {
        action = {
          type: "turn",
          payload: { degrees: -15 },
        };
      } else if (actionType === "turnRight") {
        action = {
          type: "turn",
          payload: { degrees: 15 },
        };
      } else if (actionType === "goto") {
        action = {
          type: "goto",
          payload: { x: 0, y: 0 },
        };
      } else if (actionType === "say") {
        action = {
          type: "say",
          payload: { text: "Hello", seconds: 2 },
        };
      } else if (actionType === "think") {
        action = {
          type: "think",
          payload: { text: "Hmm", seconds: 2 },
        };
      } else if (actionType === "repeat") {
        action = {
          type: "repeat",
          payload: { count: 2, actions: [] },
        };
      } else {
        action = {
          type: actionType,
          payload: {},
        };
      }

      if (repeatActionIndex !== null && selectedSprite) {
        const event = eventType === 'playEvent' ? 'play' : 'click';
        const eventActionObj = selectedSprite.actions?.find((a) => a.event === event);
        const eventActions = eventActionObj?.actions || [];
        const repeatAction = eventActions[repeatActionIndex];
        if (repeatAction && repeatAction.type === 'repeat') {
          const newActions = [...(repeatAction.payload?.actions || []), action];
          handleUpdateActionValue(eventType, repeatActionIndex, {
            ...repeatAction.payload,
            actions: newActions,
          });
          return;
        }
      }

      addActionToEvent(selectedSprite.id, eventType, action);
    }
  };

  const handleRemoveAction = (eventType, actionIndex) => {
    if (selectedSprite) {
      removeActionFromEvent(selectedSprite.id, eventType, actionIndex);
    }
  };

  const getActionLabel = (action) => {
    if (action.type === "move") {
      return `Move ${action.payload?.steps || 0} steps`;
    } else if (action.type === "turn") {
      const degrees = action.payload?.degrees || 0;
      return `Turn ${Math.abs(degrees)} degrees`;
    }
    return `${action.type} ${JSON.stringify(action.payload || {})}`;
  };

  const handleUpdateActionValue = (eventType, actionIndex, newPayload) => {
    if (selectedSprite) {
      updateActionInEvent(selectedSprite.id, eventType, actionIndex, newPayload);
    }
  };

  const handleActionDragStart = (e, eventType, actionIndex) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", ""); // Required for Firefox
    setDraggedActionIndex(actionIndex);
    setDraggedActionEventType(eventType);
    e.stopPropagation();
  };

  const handleActionDragOver = (e, eventType, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedActionEventType === eventType && draggedActionIndex !== null && draggedActionIndex !== targetIndex) {
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleActionDrop = (e, eventType, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selectedSprite && draggedActionEventType === eventType && draggedActionIndex !== null && draggedActionIndex !== targetIndex) {
      reorderActionInEvent(selectedSprite.id, eventType, draggedActionIndex, targetIndex);
    }
    
    setDraggedActionIndex(null);
    setDraggedActionEventType(null);
  };

  const handleActionDragEnd = () => {
    setDraggedActionIndex(null);
    setDraggedActionEventType(null);
  };

  const renderActionBlock = (action, eventType, actionIndex) => {
    let icon = null;
    let bgColor = "bg-blue-500";
    
    if (action.type === "say" || action.type === "think") {
      bgColor = "bg-purple-500";
    } else if (action.type === "repeat") {
      bgColor = "bg-orange-500";
    }
    
    // Check if it's a turn action with negative degrees (left) or positive (right)
    if (action.type === 'turn') {
      if (action.payload?.degrees < 0) {
        icon = <Icon name="undo" size={15} className="text-white mx-2" />;
      } else if (action.payload?.degrees > 0) {
        icon = <Icon name="redo" size={15} className="text-white mx-2" />;
      }
    }

    const isDragging = draggedActionIndex === actionIndex && draggedActionEventType === eventType;
    const isDragOver = draggedActionIndex !== null && 
                       draggedActionIndex !== actionIndex && 
                       draggedActionEventType === eventType;
    const isDraggedOverRepeat = draggedOverRepeat?.eventType === eventType && draggedOverRepeat?.actionIndex === actionIndex;

    if (action.type === "repeat") {
      const repeatActions = action.payload?.actions || [];
      return (
        <div
          key={actionIndex}
          draggable
          onDragStart={(e) => handleActionDragStart(e, eventType, actionIndex)}
          onDragOver={(e) => handleActionDragOver(e, eventType, actionIndex)}
          onDrop={(e) => handleActionDrop(e, eventType, actionIndex)}
          onDragEnd={handleActionDragEnd}
          className={`${bgColor} text-white px-2 py-1 my-1 text-sm rounded cursor-move ${
            isDragging ? "opacity-50" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center flex-1 gap-2">
              <span>Repeat</span>
              <input
                type="number"
                value={action.payload?.count || 2}
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 1;
                  handleUpdateActionValue(eventType, actionIndex, {
                    ...action.payload,
                    count,
                  });
                }}
                className="w-16 px-1 py-0.5 text-black text-sm rounded border border-orange-300"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onDragStart={(e) => e.stopPropagation()}
              />
              <span>times</span>
            </div>
            <button
              onClick={() => handleRemoveAction(eventType, actionIndex)}
              className="text-white hover:text-red-200 text-lg font-bold px-1 ml-2"
              title="Remove action"
            >
              ×
            </button>
          </div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDraggedOverRepeat({ eventType, actionIndex });
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDraggedOverRepeat(null);
            }}
            onDrop={(e) => handleDrop(e, eventType, actionIndex)}
            className={`min-h-[50px] p-2 border-2 border-dashed rounded mt-1 ${
              isDraggedOverRepeat
                ? 'border-white bg-orange-600'
                : 'border-orange-300 bg-orange-400'
            }`}
          >
            {repeatActions.length === 0 ? (
              <p className="text-white text-xs text-center py-2 opacity-75">
                Drag animations here
              </p>
            ) : (
              <div className="space-y-1">
                {repeatActions.map((nestedAction, nestedIndex) => {
                  let nestedBgColor = "bg-orange-600";
                  if (nestedAction.type === "say" || nestedAction.type === "think") {
                    nestedBgColor = "bg-purple-600";
                  } else if (nestedAction.type === "move" || nestedAction.type === "turn" || nestedAction.type === "goto") {
                    nestedBgColor = "bg-blue-600";
                  }
                  
                  return (
                    <div
                      key={nestedIndex}
                      className={`${nestedBgColor} text-white px-2 py-1 text-xs rounded flex items-center justify-between`}
                    >
                      <div className="flex-1 flex items-center gap-1">
                        {nestedAction.type === "move" && (
                          <>
                            <span>Move</span>
                            <input
                              type="number"
                              value={nestedAction.payload?.steps || 0}
                              onChange={(e) => {
                                const steps = parseFloat(e.target.value) || 0;
                                const newActions = [...repeatActions];
                                newActions[nestedIndex] = {
                                  ...nestedAction,
                                  payload: { ...nestedAction.payload, steps }
                                };
                                handleUpdateActionValue(eventType, actionIndex, {
                                  ...action.payload,
                                  actions: newActions,
                                });
                              }}
                              className="w-12 px-1 py-0 text-black text-xs rounded border border-blue-300"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                            <span>steps</span>
                          </>
                        )}
                        {nestedAction.type === "turn" && (
                          <>
                            <span>Turn</span>
                            <input
                              type="number"
                              value={Math.abs(nestedAction.payload?.degrees || 0)}
                              onChange={(e) => {
                                const degrees = parseFloat(e.target.value) || 0;
                                const sign = nestedAction.payload?.degrees < 0 ? -1 : 1;
                                const newActions = [...repeatActions];
                                newActions[nestedIndex] = {
                                  ...nestedAction,
                                  payload: { ...nestedAction.payload, degrees: sign * degrees }
                                };
                                handleUpdateActionValue(eventType, actionIndex, {
                                  ...action.payload,
                                  actions: newActions,
                                });
                              }}
                              className="w-12 px-1 py-0 text-black text-xs rounded border border-blue-300"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                            <span>degrees</span>
                          </>
                        )}
                        {nestedAction.type === "goto" && (
                          <>
                            <span>Go to x:</span>
                            <input
                              type="number"
                              value={nestedAction.payload?.x || 0}
                              onChange={(e) => {
                                const x = parseFloat(e.target.value) || 0;
                                const newActions = [...repeatActions];
                                newActions[nestedIndex] = {
                                  ...nestedAction,
                                  payload: { ...nestedAction.payload, x, y: nestedAction.payload?.y || 0 }
                                };
                                handleUpdateActionValue(eventType, actionIndex, {
                                  ...action.payload,
                                  actions: newActions,
                                });
                              }}
                              className="w-10 px-1 py-0 text-black text-xs rounded border border-blue-300"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                            <span>y:</span>
                            <input
                              type="number"
                              value={nestedAction.payload?.y || 0}
                              onChange={(e) => {
                                const y = parseFloat(e.target.value) || 0;
                                const newActions = [...repeatActions];
                                newActions[nestedIndex] = {
                                  ...nestedAction,
                                  payload: { ...nestedAction.payload, x: nestedAction.payload?.x || 0, y }
                                };
                                handleUpdateActionValue(eventType, actionIndex, {
                                  ...action.payload,
                                  actions: newActions,
                                });
                              }}
                              className="w-10 px-1 py-0 text-black text-xs rounded border border-blue-300"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                          </>
                        )}
                        {nestedAction.type === "say" && (
                          <>
                            <span>Say</span>
                            <input
                              type="text"
                              value={nestedAction.payload?.text || ""}
                              onChange={(e) => {
                                const newActions = [...repeatActions];
                                newActions[nestedIndex] = {
                                  ...nestedAction,
                                  payload: { ...nestedAction.payload, text: e.target.value }
                                };
                                handleUpdateActionValue(eventType, actionIndex, {
                                  ...action.payload,
                                  actions: newActions,
                                });
                              }}
                              placeholder="Hello"
                              className="w-12 px-1 py-0 text-black text-xs rounded border border-purple-300"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                            <span>for</span>
                            <input
                              type="number"
                              value={nestedAction.payload?.seconds || 2}
                              onChange={(e) => {
                                const seconds = parseFloat(e.target.value) || 0;
                                const newActions = [...repeatActions];
                                newActions[nestedIndex] = {
                                  ...nestedAction,
                                  payload: { ...nestedAction.payload, seconds }
                                };
                                handleUpdateActionValue(eventType, actionIndex, {
                                  ...action.payload,
                                  actions: newActions,
                                });
                              }}
                              className="w-10 px-1 py-0 text-black text-xs rounded border border-purple-300"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                            <span>seconds</span>
                          </>
                        )}
                        {nestedAction.type === "think" && (
                          <>
                            <span>Think</span>
                            <input
                              type="text"
                              value={nestedAction.payload?.text || ""}
                              onChange={(e) => {
                                const newActions = [...repeatActions];
                                newActions[nestedIndex] = {
                                  ...nestedAction,
                                  payload: { ...nestedAction.payload, text: e.target.value }
                                };
                                handleUpdateActionValue(eventType, actionIndex, {
                                  ...action.payload,
                                  actions: newActions,
                                });
                              }}
                              placeholder="Hmm"
                              className="w-12 px-1 py-0 text-black text-xs rounded border border-purple-300"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                            <span>for</span>
                            <input
                              type="number"
                              value={nestedAction.payload?.seconds || 2}
                              onChange={(e) => {
                                const seconds = parseFloat(e.target.value) || 0;
                                const newActions = [...repeatActions];
                                newActions[nestedIndex] = {
                                  ...nestedAction,
                                  payload: { ...nestedAction.payload, seconds }
                                };
                                handleUpdateActionValue(eventType, actionIndex, {
                                  ...action.payload,
                                  actions: newActions,
                                });
                              }}
                              className="w-10 px-1 py-0 text-black text-xs rounded border border-purple-300"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                            <span>seconds</span>
                          </>
                        )}
                        {!["move", "turn", "goto", "say", "think"].includes(nestedAction.type) && (
                          <span>{getActionLabel(nestedAction)}</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newActions = repeatActions.filter((_, idx) => idx !== nestedIndex);
                          handleUpdateActionValue(eventType, actionIndex, {
                            ...action.payload,
                            actions: newActions,
                          });
                        }}
                        className="text-white hover:text-red-200 text-sm font-bold px-1 ml-2"
                        title="Remove nested action"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        key={actionIndex}
        draggable
        onDragStart={(e) => handleActionDragStart(e, eventType, actionIndex)}
        onDragOver={(e) => handleActionDragOver(e, eventType, actionIndex)}
        onDrop={(e) => handleActionDrop(e, eventType, actionIndex)}
        onDragEnd={handleActionDragEnd}
        className={`flex items-center justify-between ${bgColor} text-white px-2 py-1 my-1 text-sm rounded cursor-move ${
          isDragging ? "opacity-50" : ""
        } ${
          isDragOver ? "border-2 border-yellow-400 border-dashed" : ""
        }`}
      >
        <div className="flex items-center flex-1 gap-2">
          {icon}
          {action.type === "move" && (
            <>
              <span>Move</span>
              <input
                type="number"
                value={action.payload?.steps || 0}
                onChange={(e) => {
                  const steps = parseFloat(e.target.value) || 0;
                  handleUpdateActionValue(eventType, actionIndex, { steps });
                }}
                className="w-16 px-1 py-0.5 text-black text-sm rounded border border-blue-300"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onDragStart={(e) => e.stopPropagation()}
              />
              <span>steps</span>
            </>
          )}
          {action.type === "turn" && (
            <>
              <span>Turn</span>
              <input
                type="number"
                value={Math.abs(action.payload?.degrees || 0)}
                onChange={(e) => {
                  const degrees = parseFloat(e.target.value) || 0;
                  const sign = action.payload?.degrees < 0 ? -1 : 1;
                  handleUpdateActionValue(eventType, actionIndex, { degrees: sign * degrees });
                }}
                className="w-16 px-1 py-0.5 text-black text-sm rounded border border-blue-300"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onDragStart={(e) => e.stopPropagation()}
              />
              <span>degrees</span>
            </>
          )}
          {action.type === "goto" && (
            <>
              <span>Go to x:</span>
              <input
                type="number"
                value={action.payload?.x || 0}
                onChange={(e) => {
                  const x = parseFloat(e.target.value) || 0;
                  handleUpdateActionValue(eventType, actionIndex, { x, y: action.payload?.y || 0 });
                }}
                className="w-16 px-1 py-0.5 text-black text-sm rounded border border-blue-300"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onDragStart={(e) => e.stopPropagation()}
              />
              <span>y:</span>
              <input
                type="number"
                value={action.payload?.y || 0}
                onChange={(e) => {
                  const y = parseFloat(e.target.value) || 0;
                  handleUpdateActionValue(eventType, actionIndex, { x: action.payload?.x || 0, y });
                }}
                className="w-16 px-1 py-0.5 text-black text-sm rounded border border-blue-300"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onDragStart={(e) => e.stopPropagation()}
              />
            </>
          )}
          {action.type === "say" && (
            <>
              <span>Say</span>
              <input
                type="text"
                value={action.payload?.text || ""}
                onChange={(e) => {
                  handleUpdateActionValue(eventType, actionIndex, { text: e.target.value });
                }}
                placeholder="Hello"
                className="w-20 px-1 py-0.5 text-black text-sm rounded border border-purple-300"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onDragStart={(e) => e.stopPropagation()}
              />
              <span>for</span>
              <input
                type="number"
                value={action.payload?.seconds || 2}
                onChange={(e) => {
                  const seconds = parseFloat(e.target.value) || 0;
                  handleUpdateActionValue(eventType, actionIndex, { seconds });
                }}
                className="w-12 px-1 py-0.5 text-black text-sm rounded border border-purple-300"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onDragStart={(e) => e.stopPropagation()}
              />
              <span>seconds</span>
            </>
          )}
          {action.type === "think" && (
            <>
              <span>Think</span>
              <input
                type="text"
                value={action.payload?.text || ""}
                onChange={(e) => {
                  handleUpdateActionValue(eventType, actionIndex, { text: e.target.value });
                }}
                placeholder="Hmm"
                className="w-20 px-1 py-0.5 text-black text-sm rounded border border-purple-300"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onDragStart={(e) => e.stopPropagation()}
              />
              <span>for</span>
              <input
                type="number"
                value={action.payload?.seconds || 2}
                onChange={(e) => {
                  const seconds = parseFloat(e.target.value) || 0;
                  handleUpdateActionValue(eventType, actionIndex, { seconds });
                }}
                className="w-12 px-1 py-0.5 text-black text-sm rounded border border-purple-300"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onDragStart={(e) => e.stopPropagation()}
              />
              <span>seconds</span>
            </>
          )}
          {action.type !== "move" && action.type !== "turn" && action.type !== "goto" && action.type !== "say" && action.type !== "think" && action.type !== "repeat" && (
            <span>{getActionLabel(action)}</span>
          )}
        </div>
        <button
          onClick={() => handleRemoveAction(eventType, actionIndex)}
          className="text-white hover:text-red-200 text-lg font-bold px-1 ml-2"
          title="Remove action"
        >
          ×
        </button>
      </div>
    );
  };

  return (
    <div className="flex-1 h-full overflow-auto flex flex-col">
      {/* Play Event Section */}
      <div className="flex-1 border-b border-gray-200 p-4">
        <div className="font-bold mb-2 text-lg">When Play Clicked</div>
        <div
          onDragOver={(e) => handleDragOver(e, 'playEvent')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'playEvent')}
          className={`min-h-[200px] p-4 border-2 border-dashed rounded ${
            draggedOver === 'playEvent'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
        >
          {playEventActions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              Drag and drop actions here
            </p>
          ) : (
            <div className="space-y-1">
              {playEventActions.map((action, index) => renderActionBlock(action, 'playEvent', index))}
            </div>
          )}
        </div>
      </div>

      {/* Click Event Section */}
      <div className="flex-1 p-4">
        <div className="font-bold mb-2 text-lg">When Sprite Clicked</div>
        <div
          onDragOver={(e) => handleDragOver(e, 'clickEvent')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'clickEvent')}
          className={`min-h-[200px] p-4 border-2 border-dashed rounded ${
            draggedOver === 'clickEvent'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
        >
          {clickEventActions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              Drag and drop actions here
            </p>
          ) : (
            <div className="space-y-1">
              {clickEventActions.map((action, index) => renderActionBlock(action, 'clickEvent', index))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

