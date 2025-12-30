// Collision detection utility
const SPRITE_SIZE = 100; // Default sprite size in pixels

let collisionMemory = {};
// to identify the collision pair uniquely we contact the ids in ascending order

export function checkCollision(sprite1, sprite2) {
  // Simple bounding box collision detection
  const s1Left = sprite1.curentPos.x;
  const s1Top = sprite1.curentPos.y;
  const s2Left = sprite2.curentPos.x;
  const s2Top = sprite2.curentPos.y;

  const boundary = collisionBoundary(s1Left,s1Top,s2Left,s2Top);
  if(boundary!==null){
    const id = collisionPairId(sprite1.id, sprite2.id);
    if(collisionMemory[id] && overlapsOrTouches(boundary,collisionMemory[id])) {
      return false;
    }
    else {
      collisionMemory[id] = boundary;
      return true;
    }
  }
  else {
    return false;
  }
}

function collisionPairId(id1, id2) {
  return id1.localeCompare(id2) <= 0 ? id1 + id2 : id2 + id1;
}

function collisionBoundary(x1, y1, x2, y2) {
  const SIZE = 100;

  // Box edges
  const left1 = x1, top1 = y1, right1 = x1 + SIZE, bottom1 = y1 + SIZE;
  const left2 = x2, top2 = y2, right2 = x2 + SIZE, bottom2 = y2 + SIZE;

  // Overlap edges (inclusive)
  const left   = Math.max(left1, left2);
  const top    = Math.max(top1, top2);
  const right  = Math.min(right1, right2);
  const bottom = Math.min(bottom1, bottom2);

  // Allow edge/corner touch (zero-area). Only return null if they miss entirely.
  if (left > right || top > bottom) return null;

  // Return ((top-left)(bottom-right))
  return [[left, top], [right, bottom]];
}

function overlapsOrTouches(b1, b2) {
  // Handle null/undefined inputs
  if (!b1 || !b2) return false;

  // Normalize each box to [left, top, right, bottom]
  const norm = ([[l, t], [r, b]]) => [Math.min(l, r), Math.min(t, b), Math.max(l, r), Math.max(t, b)];
  const [l1, t1, r1, b1b] = norm(b1);
  const [l2, t2, r2, b2b] = norm(b2);

  // Inclusive interval overlap on both axes ⇒ overlap or touch
  const xOverlap = l1 <= r2 && l2 <= r1;
  const yOverlap = t1 <= b2b && t2 <= b1b;

  return xOverlap && yOverlap;
}

export function clear() {
  collisionMemory = {};
}