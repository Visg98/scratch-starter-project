import React, { useState } from "react";
import CatSprite from "./CatSprite";
import DogSprite from "./DogSprite";
import RobotSprite from "./RobotSprite";
import AlienSprite from "./AlienSprite";
import BallSprite from "./BallSprite";
import BeetleSprite from "./BeetleSprite";

const SPRITES = [
  { id: "cat", name: "Cat", component: CatSprite },
  { id: "dog", name: "Dog", component: DogSprite },
  { id: "robot", name: "Robot", component: RobotSprite },
  { id: "alien", name: "Alien", component: AlienSprite },
  { id: "ball", name: "Ball", component: BallSprite },
  { id: "beetle", name: "Beetle", component: BeetleSprite },
];

export default function SpriteSelectorModal({ isOpen, onClose, onSelect }) {
  const [selectedSpriteType, setSelectedSpriteType] = useState(null);
  const [name, setName] = useState("");
  const [x, setX] = useState("0");
  const [y, setY] = useState("0");
  const [direction, setDirection] = useState("0");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSelectSprite = (sprite) => {
    setSelectedSpriteType(sprite);
    setErrorMessage(""); // Clear error when sprite is selected
  };

  const validateInputs = () => {
    if (!selectedSpriteType) {
      setErrorMessage("Please select a sprite type.");
      return false;
    }

    if (name.trim() === "") {
      setErrorMessage("Please enter a name for the sprite.");
      return false;
    }

    const xNum = parseFloat(x);
    if (x === "" || isNaN(xNum)) {
      setErrorMessage("Please enter a valid number for X position.");
      return false;
    }

    const yNum = parseFloat(y);
    if (y === "" || isNaN(yNum)) {
      setErrorMessage("Please enter a valid number for Y position.");
      return false;
    }

    const dirNum = parseFloat(direction);
    if (direction === "" || isNaN(dirNum)) {
      setErrorMessage("Please enter a valid number for direction (degrees).");
      return false;
    }

    return true;
  };

  const handleAdd = () => {
    setErrorMessage("");
    
    if (!validateInputs()) {
      return;
    }
    
    onSelect({
      ...selectedSpriteType,
      name: name.trim(),
      x: parseFloat(x),
      y: parseFloat(y),
      direction: parseFloat(direction),
    });
    
    // Reset form
    setSelectedSpriteType(null);
    setName("");
    setX("0");
    setY("0");
    setDirection("0");
    setErrorMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-11/12 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add a Sprite</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Form Fields */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sprite name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Direction (degrees)</label>
            <input
              type="number"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">X Position</label>
            <input
              type="number"
              value={x}
              onChange={(e) => setX(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Y Position</label>
            <input
              type="number"
              value={y}
              onChange={(e) => setY(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sprite Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Sprite Type</label>
          <div className="grid grid-cols-3 gap-4">
            {SPRITES.map((sprite) => {
              const SpriteComponent = sprite.component;
              const isSelected = selectedSpriteType?.id === sprite.id;
              return (
                <button
                  key={sprite.id}
                  onClick={() => handleSelectSprite(sprite)}
                  className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-100"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div className="w-20 h-20 mb-2 flex items-center justify-center">
                    <SpriteComponent />
                  </div>
                  <span className="text-sm font-medium">{sprite.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Sprite
          </button>
        </div>
      </div>
    </div>
  );
}

