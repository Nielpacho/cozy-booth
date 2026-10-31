type Point = { x: number; y: number }

/**
 * Head orientation in radians, estimated from the face mesh depth values.
 *  yaw   > 0 : the nose points toward +x (the right side of the local face frame)
 *  pitch > 0 : the head is tilted back (looking up)
 */
export type HeadPose = { yaw: number; pitch: number }

export type EarPlacement = {
  x: number
  y: number
  scale: number
  /** Horizontal foreshortening when the head turns. */
  scaleX: number
  /** Outward lean in radians. */
  tilt: number
}

export type HeadAccessoryPlacement = {
  headCenterX: number
  /** Width of the skull at the temples (face-width units). */
  headWidth: number
  hatSeatY: number
  hatWidth: number
  hatRotation: number
  /** Minor/major axis ratio of a horizontal circle (hat brim) seen at the current pitch. */
  brimTilt: number
  /** Vertical foreshortening of a hat crown at the current pitch. */
  crownScale: number
  leftEar: EarPlacement
  rightEar: EarPlacement
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y)

// Tweak these if you want accessories to sit higher / lower or look more / less 3D.
const HAT_SEAT_OFFSET = .03      // how far above the forehead landmark the hat band sits
const EAR_AZIMUTH = .9           // where on the skull (radians from the front) the ears are mounted
const EAR_OFFSET = .42           // ear distance from head centre, as a fraction of head width

export const getHeadAccessoryPlacement = (
  forehead: Point,
  leftTemple: Point,
  rightTemple: Point,
  leftEyeOuter: Point,
  rightEyeOuter: Point,
  pose: HeadPose = { yaw: 0, pitch: 0 },
): HeadAccessoryPlacement => {
  const templeSpan = distance(leftTemple, rightTemple)
  const yaw = clamp(pose.yaw, -.85, .85)
  const pitch = clamp(pose.pitch, -.55, .55)
  const headCenterX = (leftTemple.x + rightTemple.x) / 2
  const headWidth = clamp(templeSpan * 1.04, .8, 1.14)
  const sideScale = (temple: Point, eye: Point) => clamp(distance(temple, eye) / .18, .78, 1.12)

  // Ears sit on a small circle on top of the skull, so when the head turns the near ear swings
  // outward and the far ear slides toward the middle instead of both just sliding sideways.
  const earRadius = headWidth * EAR_OFFSET / Math.sin(EAR_AZIMUTH)
  const earY = forehead.y - .018 + pitch * .07
  const ear = (side: -1 | 1, temple: Point, eye: Point): EarPlacement => ({
    x: headCenterX + earRadius * Math.sin(side * EAR_AZIMUTH + yaw),
    y: earY,
    scale: sideScale(temple, eye),
    scaleX: clamp(Math.cos(side * .3 + yaw), .55, 1),
    tilt: side * .18 + yaw * .12,
  })

  return {
    headCenterX,
    headWidth,
    hatSeatY: forehead.y - HAT_SEAT_OFFSET + pitch * .08,
    hatWidth: clamp(templeSpan * 1.13, .72, 1.08),
    hatRotation: clamp(Math.atan2(rightTemple.y - leftTemple.y, rightTemple.x - leftTemple.x), -.18, .18),
    brimTilt: clamp(.2 - pitch * .38, .08, .46),
    crownScale: clamp(Math.cos(pitch * 1.1), .72, 1),
    leftEar: ear(-1, leftTemple, leftEyeOuter),
    rightEar: ear(1, rightTemple, rightEyeOuter),
  }
}