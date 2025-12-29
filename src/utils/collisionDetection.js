// Collision detection utility
const SPRITE_SIZE = 100; // Default sprite size in pixels

export function checkCollision(sprite1, sprite2) {
  // Simple bounding box collision detection
  // Each sprite's top-left corner is at (x, y) with size SPRITE_SIZE
  const s1Left = sprite1.curentPos.x;
  // const s1Right = sprite1.x + SPRITE_SIZE;
  const s1Top = sprite1.curentPos.y;
  // const s1Bottom = sprite1.y + SPRITE_SIZE;
  
  const s2Left = sprite2.curentPos.x;
  // const s2Right = sprite2.x + SPRITE_SIZE;
  const s2Top = sprite2.curentPos.y;
  // const s2Bottom = sprite2.y + SPRITE_SIZE;

  const isHorizontalOverlap = Math.abs(s1Top - s2Top) < SPRITE_SIZE;
  const isVerticalOverlap = Math.abs(s1Left - s2Left) < SPRITE_SIZE;
  // Check if bounding boxes overlap
  return (
    isVerticalOverlap && isHorizontalOverlap
  );
}

