type Point = { x: number; y: number }

export type HeadAccessoryPlacement = {
  headCenterX: number
  hatSeatY: number
  hatWidth: number
  hatRotation: number
  leftEar: { x: number; y: number; scale: number }
  rightEar: { x: number; y: number; scale: number }
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y)

export const getHeadAccessoryPlacement = (
  forehead: Point,
  leftTemple: Point,
  rightTemple: Point,
  leftEyeOuter: Point,
  rightEyeOuter: Point,
): HeadAccessoryPlacement => {
  const templeSpan = distance(leftTemple, rightTemple)
  const sideScale = (temple: Point, eye: Point) => clamp(distance(temple, eye) / .18, .78, 1.12)

  return {
    headCenterX: (leftTemple.x + rightTemple.x) / 2,
    hatSeatY: forehead.y - clamp(templeSpan * .13, .09, .13),
    hatWidth: clamp(templeSpan * 1.13, .72, 1.08),
    hatRotation: clamp(Math.atan2(rightTemple.y - leftTemple.y, rightTemple.x - leftTemple.x), -.18, .18),
    leftEar: {
      x: leftTemple.x * .72 + leftEyeOuter.x * .28,
      y: forehead.y - .018,
      scale: sideScale(leftTemple, leftEyeOuter),
    },
    rightEar: {
      x: rightTemple.x * .72 + rightEyeOuter.x * .28,
      y: forehead.y - .018,
      scale: sideScale(rightTemple, rightEyeOuter),
    },
  }
}
