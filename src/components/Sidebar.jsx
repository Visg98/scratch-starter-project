import React, { useState, useEffect } from "react";
import Icon from "./Icon";
import SpriteSelectorModal from "./SpriteSelectorModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useSprites } from "../context/SpriteContext";
import { useSelectedSprite } from "../context/SelectedSpriteContext";

export default function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [spriteToDelete, setSpriteToDelete] = useState(null);
  const { sprites, addSprite, deleteSprite } = useSprites();
  const { selectedSpriteIndex, setSelectedSpriteIndex } = useSelectedSprite();

  // Set default selected index to 0 when sprites exist
  useEffect(() => {
    if (sprites.length > 0 && (selectedSpriteIndex === null || selectedSpriteIndex >= sprites.length)) {
      setSelectedSpriteIndex(0);
    } else if (sprites.length === 0) {
      setSelectedSpriteIndex(0);
    }
  }, [sprites.length, selectedSpriteIndex, setSelectedSpriteIndex]);

  const handleSelectSprite = (sprite) => {
    addSprite({
      name: sprite.name,
      render: sprite.component,
      x: sprite.x,
      y: sprite.y,
      direction: sprite.direction,
      actions: [],
    });
  };

  const handleDeleteClick = (spriteId) => {
    const sprite = sprites.find((s) => s.id === spriteId);
    if (sprite) {
      setSpriteToDelete({ id: spriteId, name: sprite.name });
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (!spriteToDelete) return;

    // Find the index of the sprite to delete
    const spriteIndex = sprites.findIndex((sprite) => sprite.id === spriteToDelete.id);
    
    if (spriteIndex === -1) {
      setIsDeleteModalOpen(false);
      setSpriteToDelete(null);
      return;
    }

    // Update selected index before deleting
    if (spriteIndex < selectedSpriteIndex) {
      // Deleting a sprite before the selected one, decrement the index
      setSelectedSpriteIndex(selectedSpriteIndex - 1);
    } else if (spriteIndex === selectedSpriteIndex) {
      // Deleting the selected sprite, set to 0 (or first element)
      // If this is the last sprite, it will be handled by the useEffect
      setSelectedSpriteIndex(0);
    }
    // If deleting after selected index, no change needed

    // Delete the sprite
    deleteSprite(spriteToDelete.id);
    
    // Close modal and reset state
    setIsDeleteModalOpen(false);
    setSpriteToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSpriteToDelete(null);
  };

  const handleSpriteClick = (index) => {
    setSelectedSpriteIndex(index);
  };

  return (
    <>
      <div className="w-60 flex-none h-full flex flex-col border-r border-gray-200">
        <div className="flex-none overflow-y-auto">
          {/* Section 1: Motion Blocks */}
          <div className="p-2">
            <div className="font-bold"> {"Motion"} </div>
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('actionType', 'move');
                e.dataTransfer.setData('actionLabel', 'Move 10 steps');
              }}
              className="flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 text-sm cursor-move"
            >
              {"Move x steps"}
            </div>
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('actionType', 'turnLeft');
                e.dataTransfer.setData('actionLabel', 'Turn 15 degrees');
              }}
              className="flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 text-sm cursor-move"
            >
              {"Turn "}
              <Icon name="undo" size={15} className="text-white mx-2" />
              {"x degrees"}
            </div>
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('actionType', 'turnRight');
                e.dataTransfer.setData('actionLabel', 'Turn 15 degrees');
              }}
              className="flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 text-sm cursor-move"
            >
              {"Turn "}
              <Icon name="redo" size={15} className="text-white mx-2" />
              {"x degrees"}
            </div>
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('actionType', 'goto');
                e.dataTransfer.setData('actionLabel', 'Go to x: 0 y: 0');
              }}
              className="flex flex-row flex-wrap bg-blue-500 text-white px-2 py-1 my-2 text-sm cursor-move"
            >
              {"Go to x, y"}
            </div>
          </div>
          <div className="p-2">
            <div className="font-bold"> {"Looks"} </div>
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('actionType', 'say');
                e.dataTransfer.setData('actionLabel', 'Say Hello for 2 seconds');
              }}
              className="flex flex-row flex-wrap bg-purple-500 text-white px-2 py-1 my-2 text-sm cursor-move"
            >
              {"Say Hello"}
            </div>
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('actionType', 'think');
                e.dataTransfer.setData('actionLabel', 'Think Hmm for 2 seconds');
              }}
              className="flex flex-row flex-wrap bg-purple-500 text-white px-2 py-1 my-2 text-sm cursor-move"
            >
              {"Think Hmm"}
            </div>
          </div>
          <div className="p-2">
            <div className="font-bold"> {"Control"} </div>
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('actionType', 'repeat');
                e.dataTransfer.setData('actionLabel', 'Repeat animations');
              }}
              className="flex flex-row flex-wrap bg-yellow-500 text-white px-2 py-1 my-2 text-sm cursor-move"
            >
              {"Repeat animations"}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Section 2: Sprites */}
          <div className="border-t border-gray-200 p-2">
            <div className="font-bold mb-2">Sprites</div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full mb-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span>
              <span>Add Sprite</span>
            </button>
            <div className="space-y-2">
              {sprites.map((sprite, index) => {
                const SpriteComponent = sprite.render;
                const isSelected = index === selectedSpriteIndex;
                return (
                  <div
                    key={sprite.id}
                    onClick={() => handleSpriteClick(index)}
                    className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 hover:bg-blue-100"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center">
                      <SpriteComponent />
                    </div>
                    <span className="text-sm font-medium flex-1">{sprite.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(sprite.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-lg font-bold px-1"
                      title="Delete sprite"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <SpriteSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectSprite}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        spriteName={spriteToDelete?.name || ""}
      />
    </>
  );
}
