import type { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { getHeadAccessoryPlacement } from './headAccessoryPlacement'

export type CameraEffectCategory = 'all' | 'animals' | 'cute' | 'funny' | 'seasonal'
export type CameraEffectId =
  | 'none'
  | 'dog'
  | 'cat'
  | 'bunny'
  | 'bear'
  | 'deer'
  | 'fox'
  | 'blush'
  | 'sparkle-face'
  | 'heart-eyes'
  | 'angel'
  | 'coquette'
  | 'fairy'
  | 'big-eyes'
  | 'funny-face'
  | 'tiny-face'
  | 'alien'
  | 'robot'
  | 'halloween'
  | 'christmas'
  | 'valentines'
  | 'birthday'

export const cameraEffects: { id: CameraEffectId; name: string; category: CameraEffectCategory; icon: string }[] = [
  { id: 'none', name: 'No Effect', category: 'all', icon: '○' },
  { id: 'dog', name: 'Dog Lens', category: 'animals', icon: '🐶' },
  { id: 'cat', name: 'Cat Filter', category: 'animals', icon: '🐱' },
  { id: 'bunny', name: 'Bunny', category: 'animals', icon: '🐰' },
  { id: 'bear', name: 'Bear', category: 'animals', icon: '🐻' },
  { id: 'deer', name: 'Deer', category: 'animals', icon: '🦌' },
  { id: 'fox', name: 'Fox', category: 'animals', icon: '🦊' },
  { id: 'blush', name: 'Blush', category: 'cute', icon: '🌸' },
  { id: 'sparkle-face', name: 'Sparkle Face', category: 'cute', icon: '✨' },
  { id: 'heart-eyes', name: 'Heart Eyes', category: 'cute', icon: '😍' },
  { id: 'angel', name: 'Angel', category: 'cute', icon: '😇' },
  { id: 'coquette', name: 'Coquette', category: 'cute', icon: '🎀' },
  { id: 'fairy', name: 'Fairy', category: 'cute', icon: '🧚' },
  { id: 'big-eyes', name: 'Big Eyes', category: 'funny', icon: '👀' },
  { id: 'funny-face', name: 'Funny Face', category: 'funny', icon: '😜' },
  { id: 'tiny-face', name: 'Tiny Face', category: 'funny', icon: '👽' },
  { id: 'alien', name: 'Alien', category: 'funny', icon: '👾' },
  { id: 'robot', name: 'Robot', category: 'funny', icon: '🤖' },
  { id: 'halloween', name: 'Halloween', category: 'seasonal', icon: '🎃' },
  { id: 'christmas', name: 'Christmas', category: 'seasonal', icon: '🎄' },
  { id: 'valentines', name: "Valentine's Day", category: 'seasonal', icon: '💝' },
  { id: 'birthday', name: 'Birthday', category: 'seasonal', icon: '🎉' },
]

type Point = { x: number; y: number }
type Face = readonly NormalizedLandmark[]

// Canvas shadow / glow sizes are in screen pixels and ignore ctx.scale(). drawFaceEffect keeps
// this equal to the current face width so glows scale with the face.
let glowScale = 1

const pointAt = (face: Face, index: number, width: number, height: number): Point => ({
  x: (face[index]?.x ?? 0) * width,
  y: (face[index]?.y ?? 0) * height,
})

const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

const withAnchorScale = (ctx: CanvasRenderingContext2D, anchor: Point & { scaleX?: number; tilt?: number }, scale: number, draw: () => void) => {
  ctx.save()
  ctx.translate(anchor.x, anchor.y)
  ctx.rotate(anchor.tilt ?? 0)
  ctx.scale((anchor.scaleX ?? 1) * scale, scale)
  ctx.translate(-anchor.x, -anchor.y)
  draw()
  ctx.restore()
}

// Moves the origin to an ear's mount point and applies the head-turn squash + outward lean.
const withEarFrame = (ctx: CanvasRenderingContext2D, ear: Point & { scale: number; scaleX: number; tilt: number }, tiltFactor: number, draw: () => void) => {
  ctx.save()
  ctx.translate(ear.x, ear.y)
  ctx.rotate(ear.tilt * tiltFactor)
  ctx.scale(ear.scaleX * ear.scale, ear.scale)
  draw()
  ctx.restore()
}

const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size, size)
  ctx.beginPath()
  ctx.moveTo(0, .35)
  ctx.bezierCurveTo(-.95, -.25, -.45, -.85, 0, -.38)
  ctx.bezierCurveTo(.45, -.85, .95, -.25, 0, .35)
  const fill = ctx.createLinearGradient(-.55, -.65, .5, .45)
  fill.addColorStop(0, '#fff0f4')
  fill.addColorStop(.28, color)
  fill.addColorStop(1, color)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = '#ffffffa8'
  ctx.lineWidth = .055
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(-.23, -.42, .11, .055, -.55, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffffb8'
  ctx.fill()
  ctx.restore()
}

const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, rotation = 0) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.shadowColor = color
  ctx.shadowBlur = (size * .45) * glowScale
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const radius = i % 2 === 0 ? size : size * .2
    const angle = i * Math.PI / 4
    const px = Math.cos(angle) * radius
    const py = Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#ffffffb0'
  ctx.lineWidth = size * .09
  ctx.stroke()
  ctx.restore()
}

const drawBow = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation = 0) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.scale(size, size)
  const ribbon = ctx.createLinearGradient(-.45, -.3, .45, .35)
  ribbon.addColorStop(0, '#fff0f5')
  ribbon.addColorStop(.32, '#f28cac')
  ribbon.addColorStop(1, '#c94d78')
  ctx.beginPath()
  ctx.moveTo(-.07, 0)
  ctx.bezierCurveTo(-.55, -.5, -.95, -.22, -.82, .13)
  ctx.bezierCurveTo(-.7, .4, -.31, .3, -.07, .04)
  ctx.closePath()
  ctx.moveTo(.07, 0)
  ctx.bezierCurveTo(.55, -.5, .95, -.22, .82, .13)
  ctx.bezierCurveTo(.7, .4, .31, .3, .07, .04)
  ctx.closePath()
  ctx.fillStyle = ribbon
  ctx.fill()
  ctx.strokeStyle = '#fff5f7'
  ctx.lineWidth = .045
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(0, .02, .14, .17, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#dc638b'
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-.07, .13)
  ctx.lineTo(-.17, .53)
  ctx.lineTo(-.01, .43)
  ctx.lineTo(.1, .55)
  ctx.lineTo(.09, .12)
  ctx.closePath()
  ctx.fillStyle = '#e983a4'
  ctx.fill()
  ctx.restore()
}

const TAU = Math.PI * 2

const drawHalo = (ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rotation: number, now: number) => {
  ctx.save()
  ctx.shadowColor = '#ffe29a'
  ctx.shadowBlur = .05 * glowScale
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, rotation, 0, TAU)
  ctx.strokeStyle = '#fff8d8'
  ctx.lineWidth = .05
  ctx.stroke()
  ctx.shadowBlur = 0
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, rotation, 0, TAU)
  ctx.strokeStyle = '#e7b94f'
  ctx.lineWidth = .016
  ctx.stroke()
  for (let i = 0; i < 3; i++) {
    const pulse = .85 + Math.sin(now / 280 + i * 2) * .15
    drawStar(ctx, x + (i - 1) * rx * .62, y - ry * .5, .025 * pulse, '#fff7ce', now / 900 + i)
  }
  ctx.restore()
}

// Everything a hat needs to sit on the head instead of floating over it. The hat is drawn in a
// frame whose origin is the point on the forehead where the hat band touches the head.
type HatFrame = {
  /** Half the width of the skull. */
  hr: number
  /** Minor/major axis ratio of a horizontal circle (brim, band) at the current head pitch. */
  brimTilt: number
  /** Vertical foreshortening of the crown at the current head pitch. */
  crown: number
  /** Unit vector pointing to real-world "down" in the hat's frame, so floppy parts hang naturally. */
  gravity: Point
  /** Pendulum swing (radians) from recent head movement. */
  swing: number
  now: number
  /** Face width in screen pixels, needed because canvas shadow sizes ignore ctx.scale(). */
  px: number
  toHat: (point: Point) => Point
  chin: Point
  jawLeft: Point
  jawRight: Point
}

const drawContactShadow = (ctx: CanvasRenderingContext2D, y: number, radius: number, strength: number) => {
  ctx.save()
  ctx.translate(0, y)
  ctx.scale(1, .3)
  const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
  shadow.addColorStop(0, `rgba(30,18,40,${strength})`)
  shadow.addColorStop(1, 'rgba(30,18,40,0)')
  ctx.fillStyle = shadow
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, TAU)
  ctx.fill()
  ctx.restore()
}

const drawPompom = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, base: string, shade: string) => {
  ctx.save()
  ctx.translate(x, y)
  for (let i = 0; i < 12; i++) {
    const angle = i * TAU / 12
    ctx.beginPath()
    ctx.arc(Math.cos(angle) * radius * .72, Math.sin(angle) * radius * .72, radius * .38, 0, TAU)
    ctx.fillStyle = shade
    ctx.fill()
  }
  const fluff = ctx.createRadialGradient(-radius * .25, -radius * .3, radius * .05, 0, 0, radius)
  fluff.addColorStop(0, '#ffffff')
  fluff.addColorStop(1, base)
  ctx.beginPath()
  ctx.arc(0, 0, radius * .86, 0, TAU)
  ctx.fillStyle = fluff
  ctx.fill()
  ctx.restore()
}

const drawFurBandFront = (ctx: CanvasRenderingContext2D, rx: number, ry: number, thickness: number) => {
  ctx.save()
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI, false)
  ctx.strokeStyle = '#fffaf4'
  ctx.lineWidth = thickness
  ctx.stroke()
  const bumps = 24
  for (let i = 0; i <= bumps; i++) {
    const angle = i / bumps * Math.PI
    const x = Math.cos(angle) * rx
    const y = Math.sin(angle) * ry
    ;[-1, 1].forEach(side => {
      ctx.beginPath()
      ctx.arc(x, y + side * thickness * .46, thickness * (.2 + ((i + (side > 0 ? 1 : 0)) % 2) * .07), 0, TAU)
      ctx.fillStyle = '#fffaf4'
      ctx.fill()
    })
  }
  ctx.beginPath()
  ctx.ellipse(0, thickness * .14, rx, ry, 0, .06, Math.PI - .06, false)
  ctx.strokeStyle = 'rgba(222,170,176,.38)'
  ctx.lineWidth = thickness * .26
  ctx.stroke()
  ctx.restore()
}

const drawWitchHat = (ctx: CanvasRenderingContext2D, f: HatFrame) => {
  const rx = f.hr * 1.62
  const ry = Math.max(.035, rx * f.brimTilt * .72)
  const bw = f.hr * .9
  const bry = Math.max(.028, bw * f.brimTilt * .8)
  const height = f.hr * 2.35 * f.crown
  const apexX = f.hr * .3
  const bandHeight = f.hr * .2
  const bandWidth = bw * (1 - bandHeight / height * .8)

  drawContactShadow(ctx, ry + .02, bw * 1.15, .38)

  // Brim: dark underside edge first, then the lit top surface.
  ctx.save()
  ctx.shadowColor = 'rgba(20,10,30,.45)'
  ctx.shadowBlur = .025 * f.px
  ctx.shadowOffsetY = .012 * f.px
  ctx.beginPath()
  ctx.ellipse(0, .012, rx, ry, 0, 0, TAU)
  ctx.fillStyle = '#1c1228'
  ctx.fill()
  ctx.restore()
  const brim = ctx.createLinearGradient(-rx, 0, rx, 0)
  brim.addColorStop(0, '#5a4073')
  brim.addColorStop(.5, '#34234a')
  brim.addColorStop(1, '#4b3463')
  ctx.beginPath()
  ctx.ellipse(0, 0, rx, ry, 0, 0, TAU)
  ctx.fillStyle = brim
  ctx.fill()
  ctx.strokeStyle = '#8c6aa8aa'
  ctx.lineWidth = .008
  ctx.stroke()

  // Crown: its base follows the front arc of the brim ellipse, so it grows out of the brim.
  const crownPath = () => {
    ctx.beginPath()
    ctx.moveTo(-bw, 0)
    ctx.bezierCurveTo(-bw * .78, -height * .36, apexX - f.hr * .1, -height * .82, apexX, -height)
    ctx.bezierCurveTo(apexX + f.hr * .12, -height * .8, bw * .7, -height * .34, bw, 0)
    ctx.ellipse(0, 0, bw, bry, 0, 0, Math.PI, false)
    ctx.closePath()
  }
  crownPath()
  const cone = ctx.createLinearGradient(-bw, 0, bw, 0)
  cone.addColorStop(0, '#8a64aa')
  cone.addColorStop(.45, '#4a3262')
  cone.addColorStop(1, '#241634')
  ctx.fillStyle = cone
  ctx.fill()

  ctx.save()
  crownPath()
  ctx.clip()
  ctx.beginPath()
  ctx.ellipse(0, 0, bw, bry, 0, 0, Math.PI, false)
  ctx.ellipse(0, -bandHeight, bandWidth, bry, 0, Math.PI, 0, true)
  ctx.closePath()
  ctx.fillStyle = '#ed8ca2'
  ctx.fill()
  ctx.restore()

  // Buckle
  const buckleY = bry - bandHeight * .5
  ctx.beginPath()
  ctx.rect(-bandHeight * .5, buckleY - bandHeight * .5, bandHeight, bandHeight)
  ctx.strokeStyle = '#e5b95a'
  ctx.lineWidth = bandHeight * .2
  ctx.stroke()

  drawStar(ctx, apexX * .35, -height * .52, .045, '#ffd978', f.now / 1200)
}

const drawSantaHat = (ctx: CanvasRenderingContext2D, f: HatFrame) => {
  const hr = f.hr
  const rx = hr * 1.07
  const ry = Math.max(.03, rx * f.brimTilt * .7)
  const thickness = hr * .27
  const height = hr * 1.25 * f.crown

  // The floppy end hangs down in the real world and swings with head movement.
  const phi = -.7 + f.swing
  const dir = {
    x: f.gravity.x * Math.cos(phi) - f.gravity.y * Math.sin(phi),
    y: f.gravity.x * Math.sin(phi) + f.gravity.y * Math.cos(phi),
  }
  const apex = { x: -hr * .12, y: -height }
  const length = hr * .95
  const tip = { x: apex.x + dir.x * length, y: apex.y + dir.y * length }
  const normal = { x: -dir.y, y: dir.x }
  const w0 = hr * .38
  const w1 = hr * .2

  drawContactShadow(ctx, ry + thickness * .55, rx * .9, .3)

  // Far side of the fur band (mostly hidden behind the cap).
  ctx.beginPath()
  ctx.ellipse(0, 0, rx, ry, 0, 0, TAU)
  ctx.strokeStyle = '#eadcd8'
  ctx.lineWidth = thickness * .9
  ctx.stroke()

  const red = ctx.createLinearGradient(-rx, -height, rx, 0)
  red.addColorStop(0, '#ff7584')
  red.addColorStop(.55, '#d63553')
  red.addColorStop(1, '#a01f3a')
  ctx.fillStyle = red

  ctx.beginPath()
  ctx.moveTo(-rx * .96, 0)
  ctx.bezierCurveTo(-rx * .98, -height * .55, apex.x - hr * .35, apex.y + height * .12, apex.x, apex.y)
  ctx.bezierCurveTo(apex.x + hr * .35, apex.y + height * .12, rx * .98, -height * .55, rx * .96, 0)
  ctx.ellipse(0, 0, rx * .96, ry, 0, 0, Math.PI, false)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(apex.x + normal.x * w0, apex.y + normal.y * w0)
  ctx.lineTo(tip.x + normal.x * w1, tip.y + normal.y * w1)
  ctx.lineTo(tip.x - normal.x * w1, tip.y - normal.y * w1)
  ctx.lineTo(apex.x - normal.x * w0, apex.y - normal.y * w0)
  ctx.closePath()
  ctx.fill()

  // Fold shading
  ctx.beginPath()
  ctx.moveTo(-rx * .45, ry * .4)
  ctx.quadraticCurveTo(-rx * .4, -height * .5, apex.x, apex.y)
  ctx.strokeStyle = 'rgba(120,20,40,.28)'
  ctx.lineWidth = .02
  ctx.stroke()

  drawPompom(ctx, tip.x, tip.y, hr * .2, '#fff3ee', '#f1e3df')
  drawFurBandFront(ctx, rx, ry, thickness)
}

const drawPartyHat = (ctx: CanvasRenderingContext2D, f: HatFrame) => {
  const bw = f.hr * .62
  const bry = Math.max(.025, bw * f.brimTilt * .9)
  const height = f.hr * 2.0 * f.crown
  const tilt = -.14
  const cos = Math.cos(tilt)
  const sin = Math.sin(tilt)
  const baseLeft = { x: -bw * cos, y: -bw * sin }
  const baseRight = { x: bw * cos, y: bw * sin }
  const jawLeft = f.toHat(f.jawLeft)
  const jawRight = f.toHat(f.jawRight)
  const chin = f.toHat(f.chin)

  drawContactShadow(ctx, bry + .015, bw * 1.1, .3)

  ctx.save()
  ctx.rotate(tilt)
  const conePath = () => {
    ctx.beginPath()
    ctx.moveTo(-bw, 0)
    ctx.lineTo(0, -height)
    ctx.lineTo(bw, 0)
    ctx.ellipse(0, 0, bw, bry, 0, 0, Math.PI, false)
    ctx.closePath()
  }
  conePath()
  const paper = ctx.createLinearGradient(-bw, -height * .6, bw, 0)
  paper.addColorStop(0, '#ff91b5')
  paper.addColorStop(.55, '#a78cf2')
  paper.addColorStop(1, '#65c9c4')
  ctx.fillStyle = paper
  ctx.fill()

  ctx.save()
  conePath()
  ctx.clip()
  ctx.lineCap = 'round'
  for (let i = 0; i < 5; i++) {
    const y = -height * (.12 + i * .17)
    ctx.beginPath()
    ctx.moveTo(-bw, y + bw * .35)
    ctx.lineTo(bw, y - bw * .35)
    ctx.strokeStyle = 'rgba(255,255,255,.42)'
    ctx.lineWidth = .026
    ctx.stroke()
  }
  for (let i = 0; i < 4; i++) {
    const t = (i + 1) / 5
    drawStar(ctx, (i % 2 ? .25 : -.25) * bw * (1 - t), -height * t * .85, .028, '#fff3a8', f.now / 800 + i)
  }
  const shade = ctx.createLinearGradient(-bw, 0, bw, 0)
  shade.addColorStop(0, 'rgba(255,255,255,.18)')
  shade.addColorStop(.6, 'rgba(0,0,0,0)')
  shade.addColorStop(1, 'rgba(40,20,70,.22)')
  ctx.fillStyle = shade
  ctx.fillRect(-bw, -height, bw * 2, height + bry)
  ctx.restore()

  // White trim along the base
  ctx.beginPath()
  ctx.ellipse(0, 0, bw, bry, 0, 0, Math.PI, false)
  ctx.strokeStyle = '#fff7e9'
  ctx.lineWidth = .03
  ctx.stroke()

  // Streamers + pompom on top
  for (let i = 0; i < 9; i++) {
    const angle = -Math.PI / 2 + (i - 4) * .38
    const streamer = .07 + (i % 3) * .035
    ctx.beginPath()
    ctx.moveTo(0, -height)
    ctx.lineTo(Math.cos(angle) * streamer, -height + Math.sin(angle) * streamer)
    ctx.strokeStyle = ['#ffdb72', '#ff8fb0', '#7fd6cf'][i % 3]
    ctx.lineWidth = .014
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(0, -height, .055, 0, TAU)
  ctx.fillStyle = '#ffdb72'
  ctx.fill()
  ctx.restore()

  // Elastic chin strap: from both sides of the base, down the jaw, under the chin.
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(baseLeft.x, baseLeft.y)
  ctx.bezierCurveTo(jawLeft.x - .02, (baseLeft.y + jawLeft.y) / 2, jawLeft.x, jawLeft.y, chin.x - .12, chin.y + .035)
  ctx.quadraticCurveTo(chin.x, chin.y + .11, chin.x + .12, chin.y + .035)
  ctx.bezierCurveTo(jawRight.x, jawRight.y, jawRight.x + .02, (baseRight.y + jawRight.y) / 2, baseRight.x, baseRight.y)
  ctx.lineCap = 'round'
  ctx.strokeStyle = 'rgba(70,40,60,.35)'
  ctx.lineWidth = .014
  ctx.stroke()
  ctx.strokeStyle = '#ffe9f1'
  ctx.lineWidth = .007
  ctx.stroke()
  ctx.restore()
}

const drawPumpkin = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size, size)
  const orange = ctx.createRadialGradient(-.1, -.14, .04, 0, 0, .39)
  orange.addColorStop(0, '#ffd071')
  orange.addColorStop(.48, '#ff9c43')
  orange.addColorStop(1, '#df582f')
  ctx.fillStyle = orange
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    ctx.ellipse(i * .15, .02, .16, .28, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.beginPath()
  ctx.moveTo(-.06, -.22)
  ctx.quadraticCurveTo(-.04, -.4, .1, -.38)
  ctx.lineTo(.12, -.18)
  ctx.closePath()
  ctx.fillStyle = '#577c48'
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-.12, .02)
  ctx.lineTo(-.04, .11)
  ctx.lineTo(.03, .02)
  ctx.lineTo(.11, .11)
  ctx.lineTo(.17, .02)
  ctx.strokeStyle = '#673723'
  ctx.lineWidth = .035
  ctx.lineJoin = 'round'
  ctx.stroke()
  ctx.restore()
}

const drawSnowflake = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.strokeStyle = '#f4fcff'
  ctx.lineWidth = .018
  ctx.lineCap = 'round'
  ctx.shadowColor = '#a8e7ff'
  ctx.shadowBlur = (.035) * glowScale
  for (let arm = 0; arm < 6; arm++) {
    ctx.save()
    ctx.rotate(arm * Math.PI / 3)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -size)
    ctx.moveTo(0, -size * .56)
    ctx.lineTo(-size * .2, -size * .76)
    ctx.moveTo(0, -size * .56)
    ctx.lineTo(size * .2, -size * .76)
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
}

const drawBlushFlower = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  for (let petal = 0; petal < 6; petal++) {
    ctx.save()
    ctx.rotate(petal * Math.PI / 3)
    ctx.beginPath()
    ctx.ellipse(0, -size * .56, size * .29, size * .48, 0, 0, Math.PI * 2)
    ctx.fillStyle = petal % 2 === 0 ? '#ff8fc1' : '#ffafd0'
    ctx.fill()
    ctx.strokeStyle = '#fff2f8'
    ctx.lineWidth = size * .055
    ctx.stroke()
    ctx.restore()
  }
  ctx.beginPath()
  ctx.arc(0, 0, size * .2, 0, Math.PI * 2)
  ctx.fillStyle = '#ffd45e'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(-size * .045, -size * .055, size * .065, 0, Math.PI * 2)
  ctx.fillStyle = '#fff8c7'
  ctx.fill()
  ctx.restore()
}

const drawBlushEffect = (ctx: CanvasRenderingContext2D, leftCheek: Point, rightCheek: Point, faceTop: Point, leftTemple: Point, rightTemple: Point, now: number, crownCenterX = 0, crownScale = 1, crownDrop = 0) => {
  ;[leftCheek, rightCheek].forEach((cheek, side) => {
    const blush = ctx.createRadialGradient(cheek.x, cheek.y, .015, cheek.x, cheek.y, .15)
    blush.addColorStop(0, '#f376a477')
    blush.addColorStop(.58, '#f58aa244')
    blush.addColorStop(1, '#f0809b00')
    ctx.fillStyle = blush
    ctx.beginPath()
    ctx.ellipse(cheek.x, cheek.y, .15, .09, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.save()
    ctx.translate(cheek.x, cheek.y + .035)
    ctx.rotate(side === 0 ? -.22 : .22)
    ctx.lineCap = 'round'
    for (let line = 0; line < 4; line++) {
      ctx.beginPath()
      ctx.moveTo(-.055 + line * .029, -.008)
      ctx.lineTo(-.047 + line * .029, .012)
      ctx.strokeStyle = '#fff9f5'
      ctx.lineWidth = .009
      ctx.stroke()
    }
    ctx.restore()
  })

  const flowers = [
    { x: -0.49, size: .075, offset: -.12 },
    { x: -0.36, size: .105, offset: -.21 },
    { x: -0.22, size: .09, offset: -.29 },
    { x: 0, size: .17, offset: -.34 },
    { x: 0.22, size: .09, offset: -.29 },
    { x: 0.36, size: .105, offset: -.21 },
    { x: 0.49, size: .075, offset: -.12 },
  ]
  flowers.forEach((flower, index) => {
    drawBlushFlower(ctx, crownCenterX + flower.x * crownScale, faceTop.y + flower.offset + crownDrop, flower.size * crownScale, Math.sin(now / 1700 + index) * .035)
  })

  drawStar(ctx, leftTemple.x - .055, leftTemple.y + .015, .034, '#fff8de', now / 900)
  drawStar(ctx, rightTemple.x + .055, rightTemple.y + .015, .042, '#fff8de', -now / 1100)
  drawStar(ctx, leftTemple.x - .12, leftTemple.y + .13, .021, '#ffd4ea', now / 700)
  drawStar(ctx, rightTemple.x + .12, rightTemple.y + .13, .022, '#ffd4ea', -now / 800)
}

const drawEmoji = (ctx: CanvasRenderingContext2D, emoji: string, x: number, y: number, size: number) => {
  ctx.save()
  ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, x, y)
  ctx.restore()
}

const drawEar = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, inner: string, long = false, side: -1 | 1 = 1) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(side * (long ? .09 : .18))
  ctx.beginPath()
  if (long) {
    ctx.ellipse(0, -.12, .105, .31, 0, 0, Math.PI * 2)
  } else {
    ctx.moveTo(-.16, .08)
    ctx.quadraticCurveTo(-.13, -.34, 0, -.28)
    ctx.quadraticCurveTo(.15, -.31, .16, .08)
    ctx.quadraticCurveTo(0, .19, -.16, .08)
  }
  const outer = ctx.createLinearGradient(-.14, -.3, .15, .16)
  outer.addColorStop(0, '#fff8f5')
  outer.addColorStop(.24, color)
  outer.addColorStop(1, color)
  ctx.fillStyle = outer
  ctx.fill()
  ctx.strokeStyle = '#ffffffc9'
  ctx.lineWidth = .018
  ctx.stroke()
  ctx.beginPath()
  if (long) ctx.ellipse(0, -.12, .05, .22, 0, 0, Math.PI * 2)
  else {
    ctx.moveTo(-.09, .04)
    ctx.quadraticCurveTo(-.07, -.2, 0, -.19)
    ctx.quadraticCurveTo(.08, -.2, .09, .04)
    ctx.closePath()
  }
  const innerFill = ctx.createLinearGradient(0, -.26, 0, .1)
  innerFill.addColorStop(0, '#fff4f5')
  innerFill.addColorStop(.35, inner)
  innerFill.addColorStop(1, inner)
  ctx.fillStyle = innerFill
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(-.035, -.19, .018, .055, -.28, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffffa8'
  ctx.fill()
  ctx.restore()
}

const drawDogEar = (ctx: CanvasRenderingContext2D, x: number, y: number, side: -1 | 1) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.beginPath()
  ctx.moveTo(0, .04)
  ctx.bezierCurveTo(side * .18, -.07, side * .34, -.01, side * .31, .18)
  ctx.bezierCurveTo(side * .29, .36, side * .15, .41, side * .07, .27)
  ctx.bezierCurveTo(side * .02, .2, 0, .12, 0, .04)
  ctx.closePath()
  const fur = ctx.createLinearGradient(-.1, -.02, side * .32, .35)
  fur.addColorStop(0, '#d6a17c')
  fur.addColorStop(.5, '#a66d50')
  fur.addColorStop(1, '#704631')
  ctx.fillStyle = fur
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(side * .035, .12)
  ctx.bezierCurveTo(side * .15, .04, side * .24, .08, side * .22, .2)
  ctx.bezierCurveTo(side * .2, .3, side * .13, .33, side * .09, .24)
  ctx.closePath()
  const inner = ctx.createLinearGradient(0, .04, side * .25, .31)
  inner.addColorStop(0, '#f3c6a9')
  inner.addColorStop(1, '#c67f6f')
  ctx.fillStyle = inner
  ctx.fill()
  ctx.strokeStyle = '#fff0d877'
  ctx.lineWidth = .012
  ctx.stroke()
  ctx.restore()
}

const drawAnimalNose = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size = .045) => {
  ctx.save()
  ctx.shadowColor = '#35201c55'
  ctx.shadowBlur = (size * .5) * glowScale
  ctx.beginPath()
  ctx.ellipse(x, y, size, size * .72, 0, 0, Math.PI * 2)
  const nose = ctx.createLinearGradient(x, y - size, x, y + size)
  nose.addColorStop(0, '#fff1ed')
  nose.addColorStop(.22, color)
  nose.addColorStop(1, color)
  ctx.fillStyle = nose
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#ffffffa0'
  ctx.lineWidth = size * .08
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(x - size * .25, y - size * .22, size * .2, size * .13, -.3, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffffa8'
  ctx.fill()
  ctx.restore()
}

const drawCatNose = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.save()
  ctx.shadowColor = '#633c4966'
  ctx.shadowBlur = (size * .35) * glowScale
  ctx.beginPath()
  ctx.moveTo(x - size, y - size * .4)
  ctx.quadraticCurveTo(x, y - size * .8, x + size, y - size * .4)
  ctx.quadraticCurveTo(x + size * .72, y + size * .55, x, y + size * .68)
  ctx.quadraticCurveTo(x - size * .72, y + size * .55, x - size, y - size * .4)
  const nose = ctx.createLinearGradient(x, y - size, x, y + size)
  nose.addColorStop(0, '#ffd9e2')
  nose.addColorStop(1, '#d26483')
  ctx.fillStyle = nose
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#fff4f4'
  ctx.lineWidth = size * .08
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x, y + size * .56)
  ctx.quadraticCurveTo(x, y + size * 1.15, x - size * .55, y + size * 1.3)
  ctx.moveTo(x, y + size * .56)
  ctx.quadraticCurveTo(x, y + size * 1.15, x + size * .55, y + size * 1.3)
  ctx.strokeStyle = '#76535b'
  ctx.lineWidth = size * .11
  ctx.lineCap = 'round'
  ctx.stroke()
  ctx.restore()
}

const drawDogMuzzle = (ctx: CanvasRenderingContext2D, nose: Point, mouth: Point, lowerLip: Point, leftCorner: Point, rightCorner: Point, faceWidth: number) => {
  const muzzleY = nose.y + (mouth.y - nose.y) * .78
  const muzzleWidth = Math.max(.055, Math.hypot(rightCorner.x - leftCorner.x, rightCorner.y - leftCorner.y) * .34)
  const muzzleHeight = Math.min(.09, muzzleWidth * .72)

  ctx.save()
  ctx.fillStyle = '#f7e8d9d9'
  ;[-1, 1].forEach(side => {
    ctx.beginPath()
    ctx.ellipse(nose.x + side * muzzleWidth * .52, muzzleY, muzzleWidth * .57, muzzleHeight, 0, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.beginPath()
  ctx.moveTo(nose.x, nose.y + .035)
  ctx.lineTo(nose.x, mouth.y + .015)
  ctx.strokeStyle = '#66483d'
  ctx.lineWidth = .009
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(leftCorner.x, mouth.y + .02)
  ctx.quadraticCurveTo(nose.x, mouth.y + .12, rightCorner.x, mouth.y + .02)
  ctx.strokeStyle = '#66483d'
  ctx.lineWidth = .012
  ctx.stroke()

  const mouthOpening = Math.hypot(lowerLip.x - mouth.x, lowerLip.y - mouth.y)
  if (mouthOpening > .024 && faceWidth > 0) {
    const tongueWidth = Math.min(.045, mouthOpening * .8)
    const tongueTop = lowerLip.y + .008
    ctx.beginPath()
    ctx.moveTo(lowerLip.x - tongueWidth, tongueTop)
    ctx.quadraticCurveTo(lowerLip.x, tongueTop - .015, lowerLip.x + tongueWidth, tongueTop)
    ctx.lineTo(lowerLip.x + tongueWidth * .72, tongueTop + Math.min(.13, mouthOpening * 1.8))
    ctx.quadraticCurveTo(lowerLip.x, tongueTop + Math.min(.17, mouthOpening * 2.2), lowerLip.x - tongueWidth * .72, tongueTop + Math.min(.13, mouthOpening * 1.8))
    ctx.closePath()
    ctx.fillStyle = '#ed7890'
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(lowerLip.x, tongueTop + .015)
    ctx.lineTo(lowerLip.x, tongueTop + Math.min(.1, mouthOpening * 1.6))
    ctx.strokeStyle = '#c95f7a'
    ctx.lineWidth = .006
    ctx.stroke()
  }
  ctx.restore()
}

const drawGlossyEye = (ctx: CanvasRenderingContext2D, center: Point, radiusX: number, radiusY: number, irisColor: string) => {
  ctx.save()
  ctx.shadowColor = '#291c2655'
  ctx.shadowBlur = (radiusX * .24) * glowScale
  ctx.beginPath()
  ctx.ellipse(center.x, center.y, radiusX, radiusY, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#fffdfb'
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#493a3a'
  ctx.lineWidth = radiusX * .1
  ctx.stroke()

  const irisX = center.x
  const irisY = center.y + radiusY * .035
  const iris = ctx.createRadialGradient(irisX - radiusX * .16, irisY - radiusY * .2, radiusX * .06, irisX, irisY, radiusX * .69)
  iris.addColorStop(0, '#725046')
  iris.addColorStop(.28, irisColor)
  iris.addColorStop(1, '#17131a')
  ctx.beginPath()
  ctx.ellipse(irisX, irisY, radiusX * .68, radiusY * .78, 0, 0, Math.PI * 2)
  ctx.fillStyle = iris
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(irisX, irisY + radiusY * .03, radiusX * .38, radiusY * .52, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#100d15'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(irisX - radiusX * .24, irisY - radiusY * .32, radiusX * .16, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(irisX + radiusX * .2, irisY + radiusY * .2, radiusX * .07, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.restore()
}

const drawBigEyes = (ctx: CanvasRenderingContext2D, leftEye: Point, rightEye: Point, face: Face, width: number, height: number, toLocal: (point: Point) => Point) => {
  const leftIris = face.length > 468 ? toLocal(pointAt(face, 468, width, height)) : leftEye
  const rightIris = face.length > 473 ? toLocal(pointAt(face, 473, width, height)) : rightEye
  const eyeSpacing = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y)
  const radiusX = Math.max(.055, Math.min(.105, eyeSpacing * .34))
  const radiusY = radiusX * 1.12
  drawGlossyEye(ctx, leftIris, radiusX, radiusY, '#4b3027')
  drawGlossyEye(ctx, rightIris, radiusX, radiusY, '#4b3027')
}

const smoothClosedPath = (ctx: CanvasRenderingContext2D, points: Point[]) => {
  const count = points.length
  const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
  const start = mid(points[count - 1], points[0])
  ctx.moveTo(start.x, start.y)
  for (let i = 0; i < count; i++) {
    const point = points[i]
    const next = mid(point, points[(i + 1) % count])
    ctx.quadraticCurveTo(point.x, point.y, next.x, next.y)
  }
  ctx.closePath()
}

// One slanted almond eye sized from the real eye corners. `pointedSide` is the side of the
// eye (-1 = left, 1 = right) where the almond comes to a point; `slant` lifts that end.
const drawAlienEye = (ctx: CanvasRenderingContext2D, left: Point, right: Point, pointedSide: -1 | 1, slant: number) => {
  const cx = (left.x + right.x) / 2
  const cy = (left.y + right.y) / 2
  const axis = Math.atan2(right.y - left.y, right.x - left.x)
  const width = Math.hypot(right.x - left.x, right.y - left.y) * 1.7
  const height = width * .36
  const tipX = pointedSide * width / 2
  const roundX = -pointedSide * width * .46

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(axis + slant)
  ctx.shadowColor = '#6cff7a'
  ctx.shadowBlur = .02 * glowScale
  ctx.beginPath()
  ctx.moveTo(tipX, 0)
  ctx.bezierCurveTo(tipX * .3, -height * 1.05, roundX * .95, -height * 1.1, roundX, 0)
  ctx.bezierCurveTo(roundX * .95, height * 1.2, tipX * .3, height * 1.15, tipX, 0)
  ctx.closePath()
  const iris = ctx.createRadialGradient(-pointedSide * width * .12, -height * .25, width * .02, 0, 0, width * .6)
  iris.addColorStop(0, '#39492d')
  iris.addColorStop(.5, '#080d10')
  iris.addColorStop(1, '#020408')
  ctx.fillStyle = iris
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.beginPath()
  ctx.ellipse(-pointedSide * width * .17, -height * .32, width * .1, height * .12, -.45, 0, TAU)
  ctx.fillStyle = '#e7ffd1'
  ctx.fill()
  ctx.restore()
}

const drawAlienFace = (ctx: CanvasRenderingContext2D, face: Face, width: number, height: number, toLocal: (point: Point) => Point) => {
  const outline = [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365,
    379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93,
    234, 127, 162, 21, 54, 103, 67, 109,
  ].map(index => toLocal(pointAt(face, index, width, height)))
  ctx.save()
  ctx.beginPath()
  smoothClosedPath(ctx, outline)
  const tint = ctx.createLinearGradient(0, -.45, 0, .55)
  tint.addColorStop(0, '#b8ee70c4')
  tint.addColorStop(.55, '#91d548b0')
  tint.addColorStop(1, '#71bd42b0')
  ctx.fillStyle = tint
  ctx.fill()
  // Feathered edge so the skin tint blends into the real face instead of a hard cut-out.
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#8fd64855'
  ctx.lineWidth = .035
  ctx.stroke()
  ctx.restore()
}

const drawWink = (ctx: CanvasRenderingContext2D, inner: Point, outer: Point, eyeCenter: Point) => {
  ctx.save()
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(inner.x, eyeCenter.y + .012)
  ctx.quadraticCurveTo((inner.x + outer.x) / 2, eyeCenter.y + .065, outer.x, eyeCenter.y + .015)
  ctx.strokeStyle = '#d4a08b'
  ctx.lineWidth = .055
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(inner.x, eyeCenter.y + .012)
  ctx.quadraticCurveTo((inner.x + outer.x) / 2, eyeCenter.y + .065, outer.x, eyeCenter.y + .015)
  ctx.strokeStyle = '#493632'
  ctx.lineWidth = .012
  ctx.stroke()

  ctx.lineWidth = .009
  for (let lash = 0; lash < 3; lash++) {
    const x = outer.x + .015 + lash * .018
    ctx.beginPath()
    ctx.moveTo(x, eyeCenter.y + .012)
    ctx.lineTo(x + .018, eyeCenter.y - .012 - lash * .008)
    ctx.stroke()
  }
  ctx.restore()
}

const drawFunnyFace = (ctx: CanvasRenderingContext2D, mouth: Point, lowerLip: Point, leftCorner: Point, rightCorner: Point, winkInner: Point, winkOuter: Point, winkCenter: Point) => {
  const mouthWidth = Math.max(.12, Math.hypot(rightCorner.x - leftCorner.x, rightCorner.y - leftCorner.y) * 1.08)
  const mouthHeight = Math.max(.13, Math.min(.2, Math.abs(lowerLip.y - mouth.y) * 3.2))
  const tongueWidth = mouthWidth * .37
  const tongueTop = mouth.y + mouthHeight * .05
  const tongueBottom = mouth.y + mouthHeight * 1.25

  ctx.save()
  ctx.beginPath()
  ctx.ellipse(mouth.x, mouth.y + mouthHeight * .32, mouthWidth * .52, mouthHeight * .66, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#572b3c'
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(mouth.x - tongueWidth, tongueTop)
  ctx.quadraticCurveTo(mouth.x, tongueTop - mouthHeight * .12, mouth.x + tongueWidth, tongueTop)
  ctx.bezierCurveTo(mouth.x + tongueWidth * 1.1, mouth.y + mouthHeight * .65, mouth.x + tongueWidth * .8, tongueBottom, mouth.x, tongueBottom)
  ctx.bezierCurveTo(mouth.x - tongueWidth * .8, tongueBottom, mouth.x - tongueWidth * 1.1, mouth.y + mouthHeight * .65, mouth.x - tongueWidth, tongueTop)
  ctx.closePath()
  const tongue = ctx.createLinearGradient(0, tongueTop, 0, tongueBottom)
  tongue.addColorStop(0, '#ff91ad')
  tongue.addColorStop(1, '#e95c83')
  ctx.fillStyle = tongue
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(mouth.x, tongueTop + .02)
  ctx.quadraticCurveTo(mouth.x - .008, mouth.y + mouthHeight * .7, mouth.x, tongueBottom - .02)
  ctx.strokeStyle = '#c94d70'
  ctx.lineWidth = .008
  ctx.stroke()
  ctx.restore()

  drawWink(ctx, winkInner, winkOuter, winkCenter)
}

const drawRoundedPanel = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

const drawRobotVisor = (ctx: CanvasRenderingContext2D, leftEye: Point, rightEye: Point, leftTemple: Point, rightTemple: Point) => {
  const centerY = (leftEye.y + rightEye.y) / 2
  const panelWidth = Math.max(.62, Math.abs(rightEye.x - leftEye.x) + .36)
  const panelHeight = .23
  const panelX = -panelWidth / 2
  const panelY = centerY - panelHeight / 2
  const radius = .07

  ctx.save()
  ctx.shadowColor = '#47d9ff99'
  ctx.shadowBlur = (.035) * glowScale
  drawRoundedPanel(ctx, panelX, panelY, panelWidth, panelHeight, radius)
  const glass = ctx.createLinearGradient(0, panelY, 0, panelY + panelHeight)
  glass.addColorStop(0, '#526b8b')
  glass.addColorStop(.45, '#172b4d')
  glass.addColorStop(1, '#101c35')
  ctx.fillStyle = glass
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#d2e7fa'
  ctx.lineWidth = .018
  ctx.stroke()

  ;[leftEye, rightEye].forEach(eye => {
    const eyeX = Math.max(panelX + .12, Math.min(panelX + panelWidth - .12, eye.x))
    ctx.shadowColor = '#00e5ff'
    ctx.shadowBlur = (.08) * glowScale
    drawRoundedPanel(ctx, eyeX - .022, centerY - .068, .044, .136, .02)
    ctx.fillStyle = '#55efff'
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.beginPath()
    ctx.arc(eyeX - .006, centerY - .035, .006, 0, Math.PI * 2)
    ctx.fillStyle = '#e6ffff'
    ctx.fill()
  })
  ctx.restore()

  ;[leftTemple, rightTemple].forEach((temple, side) => {
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(temple.x, centerY, .075, .14, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#93b4d5'
    ctx.fill()
    ctx.strokeStyle = '#e3f4ff'
    ctx.lineWidth = .012
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(temple.x, centerY, .032, .09, 0, 0, Math.PI * 2)
    ctx.fillStyle = side === 0 ? '#3deaff' : '#3deaff'
    ctx.fill()
    ctx.restore()
  })
}

let skinSampleCanvas: HTMLCanvasElement | null = null

const drawTinyFace = (ctx: CanvasRenderingContext2D, video: HTMLVideoElement, face: Face, width: number, height: number, faceWidth: number, top: Point, leftCheek: Point, rightCheek: Point, chin: Point) => {
  if (!skinSampleCanvas) {
    skinSampleCanvas = document.createElement('canvas')
    skinSampleCanvas.width = 1
    skinSampleCanvas.height = 1
  }
  const sampleCtx = skinSampleCanvas.getContext('2d')
  if (!sampleCtx) return
  const cheek = midpoint(leftCheek, rightCheek)
  sampleCtx.drawImage(video, cheek.x - 3, cheek.y - 3, 6, 6, 0, 0, 1, 1)
  const [red, green, blue] = sampleCtx.getImageData(0, 0, 1, 1).data
  const faceCenterX = ((face[234].x + face[454].x) / 2) * width
  const cropX = Math.max(0, faceCenterX - faceWidth * .28)
  const cropY = Math.max(0, top.y - faceWidth * .05)
  const cropWidth = Math.min(faceWidth * .56, width - cropX)
  const cropHeight = Math.min(Math.max(1, chin.y - cropY + faceWidth * .04), height - cropY)
  const centerY = (top.y + chin.y) / (2 * height)
  const faceHeight = cropHeight / faceWidth

  ctx.save()
  ctx.beginPath()
  ctx.ellipse(0, centerY, .29, faceHeight * .48, 0, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(${red},${green},${blue},.96)`
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(0, centerY, .18, faceHeight * .31, 0, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(video, cropX, cropY, cropWidth, cropHeight, -.18, centerY - faceHeight * .31, .36, faceHeight * .62)
  ctx.restore()
}

// Tiny pendulum so floppy parts (Santa hat tip) swing when the head moves or tilts.
const hatPhysics = new Map<number, { swing: number; velocity: number; x: number; roll: number; time: number }>()
const updateHatSwing = (index: number, x: number, faceWidth: number, roll: number, now: number) => {
  let state = hatPhysics.get(index)
  if (!state) {
    state = { swing: 0, velocity: 0, x, roll, time: now }
    hatPhysics.set(index, state)
  }
  const dt = Math.min(.05, Math.max(.001, (now - state.time) / 1000))
  state.velocity += -((x - state.x) / faceWidth) * 260 - (roll - state.roll) * 40
  state.velocity += (-110 * state.swing - 8 * state.velocity) * dt
  state.swing = Math.max(-.7, Math.min(.7, state.swing + state.velocity * dt))
  state.x = x
  state.roll = roll
  state.time = now
  return state.swing
}

const drawFaceEffect = (ctx: CanvasRenderingContext2D, video: HTMLVideoElement, face: Face, effect: CameraEffectId, width: number, height: number, now: number, advancedFrame: boolean, faceIndex = 0) => {
  if (face.length < 455) return
  const left = pointAt(face, 234, width, height)
  const right = pointAt(face, 454, width, height)
  const faceWidth = Math.hypot(right.x - left.x, right.y - left.y)
  if (faceWidth < 1) return
  glowScale = faceWidth
  const angle = Math.atan2(right.y - left.y, right.x - left.x)
  const center = midpoint(left, right)
  const toLocal = (point: Point): Point => {
    const dx = (point.x - center.x) / faceWidth
    const dy = (point.y - center.y) / faceWidth
    return {
      x: dx * Math.cos(angle) + dy * Math.sin(angle),
      y: -dx * Math.sin(angle) + dy * Math.cos(angle),
    }
  }
  const top = toLocal(pointAt(face, 10, width, height))
  const nose = toLocal(pointAt(face, 1, width, height))
  const mouth = toLocal(pointAt(face, 13, width, height))
  const lowerLip = toLocal(pointAt(face, 14, width, height))
  const leftMouthCorner = toLocal(pointAt(face, 61, width, height))
  const rightMouthCorner = toLocal(pointAt(face, 291, width, height))
  const leftEyeOuter = toLocal(pointAt(face, 33, width, height))
  const leftEyeInner = toLocal(pointAt(face, 133, width, height))
  const rightEyeInner = toLocal(pointAt(face, 362, width, height))
  const rightEyeOuter = toLocal(pointAt(face, 263, width, height))
  const leftBlush = toLocal(midpoint(pointAt(face, 117, width, height), pointAt(face, 50, width, height)))
  const rightBlush = toLocal(midpoint(pointAt(face, 346, width, height), pointAt(face, 280, width, height)))
  const leftTemple = toLocal(pointAt(face, 127, width, height))
  const rightTemple = toLocal(pointAt(face, 356, width, height))
  const leftEye = toLocal(midpoint(pointAt(face, 33, width, height), pointAt(face, 133, width, height)))
  const rightEye = toLocal(midpoint(pointAt(face, 362, width, height), pointAt(face, 263, width, height)))

  ctx.save()
  ctx.translate(center.x, center.y)
  ctx.rotate(angle)
  ctx.scale(faceWidth, faceWidth)

  // Head orientation from the mesh depth values (landmark z is on the same scale as x).
  const zAt = (index: number) => (face[index]?.z ?? 0) * width
  const faceHeightPx = Math.max(Math.hypot(
    (face[10].x - face[152].x) * width,
    (face[10].y - face[152].y) * height,
  ), faceWidth * .6)
  const pose = {
    yaw: Math.atan2(zAt(454) - zAt(234), faceWidth),
    pitch: Math.atan2(zAt(10) - zAt(152), faceHeightPx),
  }
  const headAccessory = getHeadAccessoryPlacement(top, leftTemple, rightTemple, leftEyeOuter, rightEyeOuter, pose)
  const { leftEar, rightEar } = headAccessory
  const leftEarX = leftEar.x
  const rightEarX = rightEar.x
  const headTopY = top.y - .12
  const earTopY = headTopY + .04
  const chinLocal = toLocal(pointAt(face, 152, width, height))
  const jawLeft = toLocal(pointAt(face, 172, width, height))
  const jawRight = toLocal(pointAt(face, 397, width, height))
  const swing = updateHatSwing(faceIndex, center.x, faceWidth, angle, now)
  const drawFittedHat = (drawHat: (hatContext: CanvasRenderingContext2D, frame: HatFrame) => void) => {
    const seat = { x: headAccessory.headCenterX, y: headAccessory.hatSeatY }
    const rotation = headAccessory.hatRotation
    const toHat = (point: Point): Point => {
      const dx = point.x - seat.x
      const dy = point.y - seat.y
      const cosine = Math.cos(-rotation)
      const sine = Math.sin(-rotation)
      return { x: dx * cosine - dy * sine, y: dx * sine + dy * cosine }
    }
    // Real-world "down" expressed in the hat's rotated frame.
    const total = angle + rotation
    ctx.save()
    ctx.translate(seat.x, seat.y)
    ctx.rotate(rotation)
    drawHat(ctx, {
      hr: headAccessory.headWidth / 2,
      brimTilt: headAccessory.brimTilt,
      crown: headAccessory.crownScale,
      gravity: { x: Math.sin(total), y: Math.cos(total) },
      swing,
      now,
      px: faceWidth,
      toHat,
      chin: chinLocal,
      jawLeft,
      jawRight,
    })
    ctx.restore()
  }
  switch (effect) {
    case 'dog':
      withEarFrame(ctx, leftEar, .5, () => drawDogEar(ctx, 0, headTopY - leftEar.y + .06, -1))
      withEarFrame(ctx, rightEar, .5, () => drawDogEar(ctx, 0, headTopY - rightEar.y + .06, 1))
      drawDogMuzzle(ctx, nose, mouth, lowerLip, leftMouthCorner, rightMouthCorner, faceWidth)
      drawAnimalNose(ctx, nose.x, nose.y + .025, '#49342e', .05)
      break
    case 'cat':
      withEarFrame(ctx, leftEar, 0, () => drawEar(ctx, 0, earTopY - leftEar.y, '#6d5961', '#edb4c5', false, -1))
      withEarFrame(ctx, rightEar, 0, () => drawEar(ctx, 0, earTopY - rightEar.y, '#6d5961', '#edb4c5', false, 1))
      drawCatNose(ctx, nose.x, nose.y + .012, .032)
      ctx.strokeStyle = '#695660'
      ctx.lineWidth = .008
      ctx.lineCap = 'round'
      ;[-1, 1].forEach(side => {
        for (let i = 0; i < 3; i++) {
          const y = nose.y + .065 + i * .045
          ctx.beginPath()
          ctx.moveTo(nose.x + side * .04, y)
          ctx.quadraticCurveTo(nose.x + side * .2, y + (i - 1) * .018, nose.x + side * .38, y + (i - 1) * .04)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(nose.x + side * .09, y, .008, 0, Math.PI * 2)
          ctx.fillStyle = '#f8d9dc'
          ctx.fill()
        }
      })
      drawStar(ctx, nose.x - .15, nose.y - .04, .018, '#fff4f1')
      break
    case 'bunny':
      withEarFrame(ctx, leftEar, .45, () => drawEar(ctx, 0, headTopY - leftEar.y - .11, '#fff0f2', '#efaebf', true, -1))
      withEarFrame(ctx, rightEar, .45, () => drawEar(ctx, 0, headTopY - rightEar.y - .11, '#fff0f2', '#efaebf', true, 1))
      drawAnimalNose(ctx, nose.x, nose.y + .02, '#e58ba2', .03)
      break
    case 'bear':
      ;[-1, 1].forEach(side => {
        const x = side < 0 ? leftEarX : rightEarX
        const anchor = side < 0 ? leftEar : rightEar
        withAnchorScale(ctx, anchor, anchor.scale, () => {
          ctx.beginPath()
          ctx.arc(x, earTopY, .14, 0, Math.PI * 2)
          const fur = ctx.createRadialGradient(x - .04, earTopY - .05, .01, x, earTopY, .16)
          fur.addColorStop(0, '#d8b49b')
          fur.addColorStop(1, '#88614c')
          ctx.fillStyle = fur
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x, earTopY, .074, 0, Math.PI * 2)
          const inner = ctx.createRadialGradient(x - .02, earTopY - .02, .005, x, earTopY, .09)
          inner.addColorStop(0, '#f5d8ce')
          inner.addColorStop(1, '#d79691')
          ctx.fillStyle = inner
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x - .035, earTopY - .04, .018, 0, Math.PI * 2)
          ctx.fillStyle = '#fff7edaa'
          ctx.fill()
        })
      })
      drawAnimalNose(ctx, nose.x, nose.y + .04, '#705041', .05)
      drawBlushEffect(ctx, leftBlush, rightBlush, top, leftTemple, rightTemple, now, headAccessory.headCenterX, headAccessory.headWidth / 1.04, pose.pitch * .07)
      break
    case 'deer':
      ctx.strokeStyle = '#a7784e'
      ctx.lineWidth = .042
      ctx.lineCap = 'round'
      ;[-1, 1].forEach(side => {
        const x = side < 0 ? leftEarX : rightEarX
        const anchor = side < 0 ? leftEar : rightEar
        withAnchorScale(ctx, anchor, anchor.scale, () => {
          ctx.shadowColor = '#69452d66'
          ctx.shadowBlur = (.025) * glowScale
          ctx.beginPath()
          ctx.moveTo(x, headTopY + .02)
          ctx.lineTo(x + side * .02, headTopY - .21)
          ctx.lineTo(x + side * .13, headTopY - .28)
          ctx.moveTo(x + side * .02, headTopY - .08)
          ctx.lineTo(x - side * .09, headTopY - .18)
          ctx.stroke()
          ctx.shadowBlur = 0
          ;[
            [x + side * .13, headTopY - .28],
            [x - side * .09, headTopY - .18],
          ].forEach(([tipX, tipY]) => {
            ctx.beginPath()
            ctx.arc(tipX, tipY, .022, 0, Math.PI * 2)
            ctx.fillStyle = '#f4d0a5'
            ctx.fill()
          })
        })
      })
      drawAnimalNose(ctx, nose.x, nose.y + .03, '#754c43', .04)
      drawBlushFlower(ctx, -.3, headTopY - .02, .07, -.2)
      drawBlushFlower(ctx, .3, headTopY - .02, .07, .2)
      break
    case 'fox':
      ;[-1, 1].forEach(side => {
        const x = side < 0 ? leftEarX : rightEarX
        const anchor = side < 0 ? leftEar : rightEar
        withAnchorScale(ctx, anchor, anchor.scale, () => {
          ctx.beginPath()
          ctx.moveTo(x - .11, headTopY + .04)
          ctx.lineTo(x, headTopY - .24)
          ctx.lineTo(x + .11, headTopY + .04)
          ctx.closePath()
          const fur = ctx.createLinearGradient(x, headTopY - .3, x, headTopY + .04)
          fur.addColorStop(0, '#ffbe75')
          fur.addColorStop(.58, '#e9864e')
          fur.addColorStop(1, '#a84e3e')
          ctx.fillStyle = fur
          ctx.fill()
          ctx.beginPath()
          ctx.moveTo(x - .06, headTopY + .02)
          ctx.lineTo(x, headTopY - .12)
          ctx.lineTo(x + .06, headTopY + .02)
          ctx.closePath()
          ctx.fillStyle = '#f9d5bd'
          ctx.fill()
          ctx.strokeStyle = '#fff2dd'
          ctx.lineWidth = .012
          ctx.stroke()
        })
      })
      drawAnimalNose(ctx, nose.x, nose.y + .035, '#674039', .04)
      ;[leftBlush, rightBlush].forEach((cheek, side) => {
        ctx.beginPath()
        ctx.ellipse(cheek.x, cheek.y + .025, .11, .065, side ? -.18 : .18, 0, Math.PI * 2)
        ctx.fillStyle = '#fff5e4d8'
        ctx.fill()
      })
      break
    case 'blush':
      drawBlushEffect(ctx, leftBlush, rightBlush, top, leftTemple, rightTemple, now, headAccessory.headCenterX, headAccessory.headWidth / 1.04, pose.pitch * .07)
      break
    case 'sparkle-face':
      ;[
        [-.48, top.y + .05, .052],
        [.48, top.y + .05, .052],
        [-.42, top.y + .34, .034],
        [.42, top.y + .34, .034],
        [-.28, top.y - .08, .025],
        [.28, top.y - .08, .025],
      ].forEach(([x, y, size], i) => {
        drawStar(ctx, x, y, size * (.84 + Math.sin(now / 260 + i) * .16), '#fff4b6', now / 900 + i)
      })
      break
    case 'fairy':
      ;[-1, 1].forEach(side => {
        ctx.save()
        ctx.translate(side * .48, top.y + .14)
        ctx.rotate(side * -.2)
        ctx.globalAlpha = .78
        const wing = ctx.createRadialGradient(0, 0, .01, 0, 0, .18)
        wing.addColorStop(0, '#fff7ff')
        wing.addColorStop(.55, '#e8caffaa')
        wing.addColorStop(1, '#c7a6ff00')
        ctx.fillStyle = wing
        ctx.beginPath()
        ctx.ellipse(0, -.07, .1, .2, -.22, 0, Math.PI * 2)
        ctx.ellipse(side * .06, .12, .09, .16, .3, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })
      drawHalo(ctx, headAccessory.headCenterX, top.y - .24 + pose.pitch * .1, headAccessory.headWidth * .24, Math.max(.025, headAccessory.headWidth * .24 * headAccessory.brimTilt * .6), headAccessory.hatRotation, now)
      for (let i = 0; i < 8; i++) {
        const angle = now / 1800 + i * Math.PI / 4
        const x = Math.cos(angle) * (.42 + i % 2 * .05)
        const y = top.y + .13 + Math.sin(angle) * .32
        drawStar(ctx, x, y, i % 2 ? .022 : .035, i % 2 ? '#f5d8ff' : '#ffe998', -angle)
      }
      break
    case 'heart-eyes':
      drawHeart(ctx, leftEye.x, leftEye.y, .105, '#ef7394')
      drawHeart(ctx, rightEye.x, rightEye.y, .105, '#ef7394')
      drawStar(ctx, leftEye.x - .13, leftEye.y - .08, .028, '#fff4df')
      drawStar(ctx, rightEye.x + .13, rightEye.y - .08, .028, '#fff4df')
      break
    case 'angel':
      drawHalo(ctx, headAccessory.headCenterX, top.y - .27 + pose.pitch * .1, headAccessory.headWidth * .25, Math.max(.025, headAccessory.headWidth * .25 * headAccessory.brimTilt * .6), headAccessory.hatRotation, now)
      ;[-1, 1].forEach(side => {
        ctx.save()
        ctx.translate(side * .42, top.y + .08)
        ctx.rotate(side * -.35)
        ctx.beginPath()
        ctx.ellipse(0, 0, .09, .2, 0, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff88'
        ctx.fill()
        ctx.strokeStyle = '#f4e3bf'
        ctx.lineWidth = .012
        ctx.stroke()
        ctx.restore()
      })
      drawStar(ctx, -.37, top.y - .06, .045, '#ffe7a0')
      drawStar(ctx, .37, top.y - .06, .045, '#ffe7a0')
      break
    case 'coquette':
      drawBow(ctx, leftEarX, leftEar.y + .01, .22 * leftEar.scale, leftEar.tilt * .8)
      drawBow(ctx, rightEarX, rightEar.y + .01, .22 * rightEar.scale, rightEar.tilt * .8)
      drawBlushEffect(ctx, leftBlush, rightBlush, top, leftTemple, rightTemple, now, headAccessory.headCenterX, headAccessory.headWidth / 1.04, pose.pitch * .07)
      drawHeart(ctx, -.43, -.02 + Math.sin(now / 400) * .025, .05, '#ef9aae')
      drawHeart(ctx, .43, .14 + Math.cos(now / 430) * .025, .05, '#ef9aae')
      break
    case 'big-eyes':
      if (!advancedFrame) drawBigEyes(ctx, leftEye, rightEye, face, width, height, toLocal)
      drawStar(ctx, leftEye.x - .15, leftEye.y - .12, .035, '#fff4bb', now / 850)
      drawStar(ctx, rightEye.x + .15, rightEye.y - .12, .035, '#fff4bb', -now / 850)
      break
    case 'funny-face':
      drawFunnyFace(ctx, mouth, lowerLip, leftMouthCorner, rightMouthCorner, rightEyeInner, rightEyeOuter, rightEye)
      break
    case 'tiny-face':
      if (!advancedFrame) {
        drawTinyFace(
          ctx,
          video,
          face,
          width,
          height,
          faceWidth,
          pointAt(face, 10, width, height),
          pointAt(face, 50, width, height),
          pointAt(face, 280, width, height),
          pointAt(face, 152, width, height),
        )
      }
      drawStar(ctx, -.38, top.y + .08, .045, '#b8e3a8')
      drawStar(ctx, .38, top.y + .08, .045, '#b8e3a8')
      ctx.beginPath()
      ctx.ellipse(0, top.y + .12, .54, .12, 0, Math.PI * .08, Math.PI * .92)
      ctx.strokeStyle = '#d5efb9aa'
      ctx.lineWidth = .018
      ctx.setLineDash([.035, .045])
      ctx.stroke()
      ctx.setLineDash([])
      break
    case 'alien':
      if (!advancedFrame) {
        drawAlienFace(ctx, face, width, height, toLocal)
        drawAlienEye(ctx, leftEyeOuter, leftEyeInner, -1, .32)
        drawAlienEye(ctx, rightEyeInner, rightEyeOuter, 1, -.32)
      }
      drawStar(ctx, 0, top.y - .12, .035, '#d6ffad')
      ctx.beginPath()
      ctx.moveTo(0, top.y - .32)
      ctx.quadraticCurveTo(.03, top.y - .53, .13, top.y - .55)
      ctx.strokeStyle = '#9bed63'
      ctx.lineWidth = .025
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(.14, top.y - .56, .055, 0, Math.PI * 2)
      ctx.fillStyle = '#c9ff80'
      ctx.shadowColor = '#aaff5a'
      ctx.shadowBlur = (.06) * glowScale
      ctx.fill()
      ctx.shadowBlur = 0
      break
    case 'robot':
      if (!advancedFrame) drawRobotVisor(ctx, leftEye, rightEye, leftTemple, rightTemple)
      ;[leftTemple, rightTemple].forEach((temple, side) => {
        ctx.strokeStyle = '#76edff'
        ctx.lineWidth = .018
        ctx.beginPath()
        ctx.moveTo(temple.x, (leftEye.y + rightEye.y) / 2 + .12)
        ctx.lineTo(temple.x + (side ? .1 : -.1), top.y + .04)
        ctx.lineTo(temple.x + (side ? .17 : -.17), top.y + .04)
        ctx.stroke()
        drawStar(ctx, temple.x + (side ? .18 : -.18), top.y + .04, .022, '#bbf8ff')
      })
      break
    case 'halloween':
      drawFittedHat(drawWitchHat)
      drawPumpkin(ctx, .4, top.y + .2, .17)
      drawStar(ctx, -.4, top.y + .1, .05, '#f59a63', now / 700)
      drawStar(ctx, .4, top.y + .1, .05, '#d4a0db', now / 700)
      break
    case 'christmas':
      drawFittedHat(drawSantaHat)
      drawSnowflake(ctx, -.42, top.y + .12 + Math.sin(now / 900) * .025, .09, now / 1600)
      drawSnowflake(ctx, .42, top.y + .2 + Math.cos(now / 1100) * .025, .075, -now / 1400)
      drawStar(ctx, 0, top.y + .17, .024, '#ffedb5', now / 800)
      break
    case 'valentines':
      drawBow(ctx, leftEarX, leftEar.y + .01, .19 * leftEar.scale, leftEar.tilt * .7)
      drawBow(ctx, rightEarX, rightEar.y + .01, .19 * rightEar.scale, rightEar.tilt * .7)
      drawBlushEffect(ctx, leftBlush, rightBlush, top, leftTemple, rightTemple, now, headAccessory.headCenterX, headAccessory.headWidth / 1.04, pose.pitch * .07)
      drawHeart(ctx, -.44, top.y + .12 + Math.sin(now / 350) * .03, .05, '#f6a9bc')
      drawHeart(ctx, .44, top.y + .25 + Math.cos(now / 360) * .03, .05, '#f6a9bc')
      break
    case 'birthday':
      drawFittedHat(drawPartyHat)
      for (let i = 0; i < 8; i++) {
        const x = Math.sin(i * 7.3 + now / 1200) * .55
        const y = top.y + .05 + ((i * 19) % 42) / 100
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(now / 900 + i)
        ctx.fillStyle = ['#f080a0', '#f4c95d', '#87c9b0', '#9d9be8'][i % 4]
        ctx.fillRect(-.015, -.026, .03, .052)
        ctx.restore()
      }
      drawStar(ctx, -.4, top.y + .04, .04, '#fff0a5', now / 700)
      drawStar(ctx, .4, top.y + .04, .04, '#fff0a5', -now / 700)
      break
  }

  ctx.restore()
}

export const renderCameraFrame = (
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  faces: readonly Face[] | null,
  effect: CameraEffectId,
  now: number,
  advancedFrame: HTMLCanvasElement | null = null,
) => {
  const { videoWidth: width, videoHeight: height } = video
  if (!width || !height) return
  if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
    ctx.canvas.width = width
    ctx.canvas.height = height
  }
  ctx.drawImage(advancedFrame ?? video, 0, 0, width, height)
  if (effect === 'none' || !faces) return
  faces.forEach((face, faceIndex) => {
    if (face.length < 455) return
    const left = pointAt(face, 234, width, height)
    const right = pointAt(face, 454, width, height)
    const faceWidth = Math.hypot(right.x - left.x, right.y - left.y)
    if (faceWidth < 1) return

    drawFaceEffect(ctx, video, face, effect, width, height, now, advancedFrame !== null, faceIndex)
  })
}

/**
 * Adaptive (One Euro) smoothing + face tracking across frames.
 *  - still head  -> heavy smoothing, so accessories don't jitter
 *  - moving head -> almost no smoothing, so accessories don't lag behind
 * Faces are matched by position so effects don't swap between people, and a face that drops out
 * for a split second is held for 250ms instead of making the effect flicker off.
 */
type FaceTrack = {
  out: NormalizedLandmark[]
  raw: Float32Array
  filtered: Float32Array
  deriv: Float32Array
  lastUpdate: number
  lastSeen: number
}

export type FaceSmoother = {
  update: (detected: readonly (readonly NormalizedLandmark[])[], now: number) => NormalizedLandmark[][]
  reset: () => void
}

const smoothingAlpha = (cutoff: number, dt: number) => 1 / (1 + 1 / (TAU * cutoff) / dt)

export const createFaceSmoother = (): FaceSmoother => {
  let tracks: FaceTrack[] = []

  const centerOf = (face: readonly NormalizedLandmark[]): Point => ({
    x: (face[234].x + face[454].x) / 2,
    y: (face[234].y + face[454].y) / 2,
  })

  const filterValue = (track: FaceTrack, index: number, value: number, dt: number, minCutoff: number, beta: number) => {
    const speed = (value - track.raw[index]) / dt
    track.deriv[index] += smoothingAlpha(1, dt) * (speed - track.deriv[index])
    const cutoff = minCutoff + beta * Math.abs(track.deriv[index])
    track.filtered[index] += smoothingAlpha(cutoff, dt) * (value - track.filtered[index])
    track.raw[index] = value
    return track.filtered[index]
  }

  const createTrack = (face: readonly NormalizedLandmark[], now: number): FaceTrack => {
    const raw = new Float32Array(face.length * 3)
    face.forEach((landmark, i) => {
      raw[i * 3] = landmark.x
      raw[i * 3 + 1] = landmark.y
      raw[i * 3 + 2] = landmark.z
    })
    return { out: face.map(landmark => ({ ...landmark })), raw, filtered: raw.slice(), deriv: new Float32Array(face.length * 3), lastUpdate: now, lastSeen: now }
  }

  const update: FaceSmoother['update'] = (detected, now) => {
    const taken = new Set<FaceTrack>()
    const next: FaceTrack[] = []

    detected.forEach(face => {
      if (face.length < 455) return
      const center = centerOf(face)
      let best: FaceTrack | undefined
      let bestDistance = .3
      for (const candidate of tracks) {
        if (taken.has(candidate) || candidate.out.length !== face.length) continue
        const trackCenter = centerOf(candidate.out)
        const distance = Math.hypot(trackCenter.x - center.x, trackCenter.y - center.y)
        if (distance < bestDistance) {
          bestDistance = distance
          best = candidate
        }
      }

      if (!best) {
        next.push(createTrack(face, now))
        return
      }
      const track: FaceTrack = best
      taken.add(track)
      const dt = Math.min(.2, Math.max(.004, (now - track.lastUpdate) / 1000))
      face.forEach((landmark, i) => {
        track.out[i] = {
          ...landmark,
          x: filterValue(track, i * 3, landmark.x, dt, 1.5, 45),
          y: filterValue(track, i * 3 + 1, landmark.y, dt, 1.5, 45),
          // Depth is noisier, so it gets a lower cutoff.
          z: filterValue(track, i * 3 + 2, landmark.z, dt, .9, 25),
        }
      })
      track.lastUpdate = now
      track.lastSeen = now
      next.push(track)
    })

    tracks.forEach(track => {
      if (!taken.has(track) && now - track.lastSeen < 250) next.push(track)
    })
    tracks = next
    return tracks.map(track => track.out)
  }

  return { update, reset: () => { tracks = [] } }
}