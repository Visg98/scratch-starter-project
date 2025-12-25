// Collision detection utility
const SPRITE_SIZE = 100; // Default sprite size in pixels

export function checkCollision(sprite1, sprite2) {
  // Simple bounding box collision detection
  // Each sprite is centered at (x, y) with size SPRITE_SIZE
  const halfSize = SPRITE_SIZE / 2;
  
  const s1Left = sprite1.x - halfSize;
  const s1Right = sprite1.x + halfSize;
  const s1Top = sprite1.y - halfSize;
  const s1Bottom = sprite1.y + halfSize;
  
  const s2Left = sprite2.x - halfSize;
  const s2Right = sprite2.x + halfSize;
  const s2Top = sprite2.y - halfSize;
  const s2Bottom = sprite2.y + halfSize;
  
  // Check if bounding boxes overlap
  return (
    s1Left < s2Right &&
    s1Right > s2Left &&
    s1Top < s2Bottom &&
    s1Bottom > s2Top
  );
}

