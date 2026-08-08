import type { Point } from "../constants.ts";

export function normalizeHypot(x: number, y: number): Point {
  const mag = Math.hypot(x, y); // Safe from extreme under/overflow
  return { x: x / mag, y: y / mag };
}

export function normalizeVector(p1: Point, p2: Point): Point {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return normalizeHypot(dx, dy);
}
