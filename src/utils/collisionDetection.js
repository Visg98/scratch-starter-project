// Collision detection utility
const SPRITE_SIZE = 100; // Default sprite size in pixels

export function checkCollision(sprite1, sprite2) {
  // Simple bounding box collision detection
  // Each sprite's top-left corner is at (x, y) with size SPRITE_SIZE
  const s1Left = sprite1.x;
  const s1Right = sprite1.x + SPRITE_SIZE;
  const s1Top = sprite1.y;
  const s1Bottom = sprite1.y + SPRITE_SIZE;
  
  const s2Left = sprite2.x;
  const s2Right = sprite2.x + SPRITE_SIZE;
  const s2Top = sprite2.y;
  const s2Bottom = sprite2.y + SPRITE_SIZE;
  
  // Check if bounding boxes overlap
  return (
    (s1Left <= s2Right && s1Right >= s2Left) ||
    (s1Top <= s2Bottom && s1Bottom >= s2Top)
  );
}

