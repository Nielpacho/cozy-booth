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

const pointAt = (face: Face, index: number, width: number, height: number): Point => ({
  x: (face[index]?.x ?? 0) * width,
  y: (face[index]?.y ?? 0) * height,
})

const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

const withAnchorScale = (ctx: CanvasRenderingContext2D, anchor: Point, scale: number, draw: () => void) => {
  ctx.save()
  ctx.translate(anchor.x, anchor.y)
  ctx.scale(scale, scale)
  ctx.translate(-anchor.x, -anchor.y)
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
  ctx.shadowBlur = size * .45
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

const drawHalo = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, now: number) => {
  ctx.save()
  ctx.shadowColor = '#ffe29a'
  ctx.shadowBlur = .09
  ctx.beginPath()
  ctx.ellipse(x, y, width, .045, -.06, 0, Math.PI * 2)
  ctx.strokeStyle = '#fff8d8'
  ctx.lineWidth = .055
  ctx.stroke()
  ctx.shadowBlur = 0
  ctx.beginPath()
  ctx.ellipse(x, y, width, .045, -.06, 0, Math.PI * 2)
  ctx.strokeStyle = '#e7b94f'
  ctx.lineWidth = .018
  ctx.stroke()
  for (let i = 0; i < 3; i++) {
    const pulse = .85 + Math.sin(now / 280 + i * 2) * .15
    drawStar(ctx, x + (i - 1) * width * .62, y - .018, .025 * pulse, '#fff7ce', now / 900 + i)
  }
  ctx.restore()
}

const drawWitchHat = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(width, width)
  ctx.shadowColor = '#39224f88'
  ctx.shadowBlur = .045
  ctx.beginPath()
  ctx.moveTo(-.34, 0)
  ctx.lineTo(.02, -.68)
  ctx.quadraticCurveTo(.13, -.3, .38, -.04)
  ctx.closePath()
  const hat = ctx.createLinearGradient(-.2, -.55, .25, .02)
  hat.addColorStop(0, '#755293')
  hat.addColorStop(1, '#302142')
  ctx.fillStyle = hat
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.beginPath()
  ctx.ellipse(0, .02, .49, .105, -.04, 0, Math.PI * 2)
  ctx.fillStyle = '#342440'
  ctx.fill()
  ctx.strokeStyle = '#c99a4d'
  ctx.lineWidth = .045
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-.16, -.25)
  ctx.quadraticCurveTo(.02, -.31, .21, -.19)
  ctx.lineTo(.27, -.12)
  ctx.quadraticCurveTo(.03, -.2, -.2, -.12)
  ctx.closePath()
  ctx.fillStyle = '#ed8ca2'
  ctx.fill()
  drawStar(ctx, .02, -.34, .075, '#ffd978')
  ctx.restore()
}

const drawSantaHat = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(width, width)
  ctx.beginPath()
  ctx.moveTo(-.42, 0)
  ctx.quadraticCurveTo(-.18, -.35, .29, -.58)
  ctx.quadraticCurveTo(.32, -.21, .46, -.02)
  ctx.closePath()
  const red = ctx.createLinearGradient(-.2, -.5, .35, 0)
  red.addColorStop(0, '#ff7584')
  red.addColorStop(1, '#bd2947')
  ctx.fillStyle = red
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(0, -.01, .46, .105, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#fff8f1'
  ctx.fill()
  ctx.strokeStyle = '#e8b8ba'
  ctx.lineWidth = .025
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(.31, -.55, .095, 0, Math.PI * 2)
  ctx.fillStyle = '#fffaf4'
  ctx.fill()
  ctx.restore()
}

const drawPartyHat = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, now: number) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(width, width)
  ctx.beginPath()
  ctx.moveTo(-.3, 0)
  ctx.lineTo(.04, -.69)
  ctx.lineTo(.34, 0)
  ctx.closePath()
  const paper = ctx.createLinearGradient(-.2, -.5, .3, 0)
  paper.addColorStop(0, '#ff91b5')
  paper.addColorStop(.55, '#a78cf2')
  paper.addColorStop(1, '#65c9c4')
  ctx.fillStyle = paper
  ctx.fill()
  ctx.strokeStyle = '#fff7e9'
  ctx.lineWidth = .035
  ctx.stroke()
  for (let i = 0; i < 3; i++) {
    const t = (i + 1) / 4
    drawStar(ctx, -.19 + t * .38, -.46 + t * .38, .045, '#fff3a8', now / 800 + i)
  }
  ctx.beginPath()
  ctx.arc(.04, -.72, .085, 0, Math.PI * 2)
  ctx.fillStyle = '#ffdb72'
  ctx.fill()
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
  ctx.shadowBlur = .035
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

const drawBlushEffect = (ctx: CanvasRenderingContext2D, leftCheek: Point, rightCheek: Point, faceTop: Point, leftTemple: Point, rightTemple: Point, now: number) => {
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
    drawBlushFlower(ctx, flower.x, faceTop.y + flower.offset, flower.size, Math.sin(now / 1700 + index) * .035)
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

const drawEar = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, inner: string, long = false) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(x < 0 ? -.18 : .18)
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
  ctx.shadowBlur = size * .5
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
  ctx.shadowBlur = size * .35
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
  ctx.shadowBlur = radiusX * .24
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

const drawAlienEyes = (ctx: CanvasRenderingContext2D, leftEye: Point, rightEye: Point) => {
  ;[leftEye, rightEye].forEach(eye => {
    ctx.save()
    ctx.shadowColor = '#6cff7a'
    ctx.shadowBlur = .025
    const iris = ctx.createRadialGradient(eye.x - .025, eye.y - .035, .006, eye.x, eye.y, .13)
    iris.addColorStop(0, '#39492d')
    iris.addColorStop(.55, '#080d10')
    iris.addColorStop(1, '#020408')
    ctx.beginPath()
    ctx.ellipse(eye.x, eye.y, .12, .14, 0, 0, Math.PI * 2)
    ctx.fillStyle = iris
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.beginPath()
    ctx.ellipse(eye.x - .035, eye.y - .055, .025, .018, -.45, 0, Math.PI * 2)
    ctx.fillStyle = '#e7ffd1'
    ctx.fill()
    ctx.restore()
  })
}

const drawAlienFace = (ctx: CanvasRenderingContext2D, face: Face, width: number, height: number, toLocal: (point: Point) => Point) => {
  const outline = [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365,
    379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93,
    234, 127, 162, 21, 54, 103, 67, 109,
  ]
  ctx.save()
  ctx.beginPath()
  outline.forEach((index, pointIndex) => {
    const point = toLocal(pointAt(face, index, width, height))
    if (pointIndex === 0) ctx.moveTo(point.x, point.y)
    else ctx.lineTo(point.x, point.y)
  })
  ctx.closePath()
  const tint = ctx.createLinearGradient(0, -.45, 0, .55)
  tint.addColorStop(0, '#b8ee70b8')
  tint.addColorStop(.55, '#91d548a8')
  tint.addColorStop(1, '#71bd42a8')
  ctx.fillStyle = tint
  ctx.fill()
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
  ctx.shadowBlur = .035
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
    ctx.shadowBlur = .08
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

const drawFaceEffect = (ctx: CanvasRenderingContext2D, video: HTMLVideoElement, face: Face, effect: CameraEffectId, width: number, height: number, now: number, advancedFrame: boolean) => {
  if (face.length < 455) return
  const left = pointAt(face, 234, width, height)
  const right = pointAt(face, 454, width, height)
  const faceWidth = Math.hypot(right.x - left.x, right.y - left.y)
  if (faceWidth < 1) return
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

  const headAccessory = getHeadAccessoryPlacement(top, leftTemple, rightTemple, leftEyeOuter, rightEyeOuter)
  const { leftEar, rightEar } = headAccessory
  const leftEarX = leftEar.x
  const rightEarX = rightEar.x
  const headTopY = top.y - .12
  const hatBaseY = headAccessory.hatSeatY
  const earTopY = headTopY + .04
  const drawFittedHat = (drawHat: (hatContext: CanvasRenderingContext2D, width: number) => void) => {
    ctx.save()
    ctx.translate(headAccessory.headCenterX, hatBaseY)
    ctx.rotate(headAccessory.hatRotation)
    ctx.beginPath()
    ctx.ellipse(0, .025, headAccessory.hatWidth * .4, .035, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#2c1f282d'
    ctx.fill()
    drawHat(ctx, headAccessory.hatWidth)
    ctx.restore()
  }
  switch (effect) {
    case 'dog':
      ctx.save()
      ctx.translate(leftEar.x, leftEar.y)
      ctx.scale(leftEar.scale, leftEar.scale)
      drawDogEar(ctx, 0, headTopY - leftEar.y + .06, -1)
      ctx.restore()
      ctx.save()
      ctx.translate(rightEar.x, rightEar.y)
      ctx.scale(rightEar.scale, rightEar.scale)
      drawDogEar(ctx, 0, headTopY - rightEar.y + .06, 1)
      ctx.restore()
      drawDogMuzzle(ctx, nose, mouth, lowerLip, leftMouthCorner, rightMouthCorner, faceWidth)
      drawAnimalNose(ctx, nose.x, nose.y + .025, '#49342e', .05)
      break
    case 'cat':
      ctx.save()
      ctx.translate(leftEar.x, leftEar.y)
      ctx.scale(leftEar.scale, leftEar.scale)
      drawEar(ctx, 0, earTopY - leftEar.y, '#6d5961', '#edb4c5')
      ctx.restore()
      ctx.save()
      ctx.translate(rightEar.x, rightEar.y)
      ctx.scale(rightEar.scale, rightEar.scale)
      drawEar(ctx, 0, earTopY - rightEar.y, '#6d5961', '#edb4c5')
      ctx.restore()
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
      ctx.save()
      ctx.translate(leftEar.x, leftEar.y)
      ctx.rotate(-.08)
      ctx.scale(leftEar.scale, leftEar.scale)
      drawEar(ctx, 0, headTopY - leftEar.y - .11, '#fff0f2', '#efaebf', true)
      ctx.restore()
      ctx.save()
      ctx.translate(rightEar.x, rightEar.y)
      ctx.rotate(.08)
      ctx.scale(rightEar.scale, rightEar.scale)
      drawEar(ctx, 0, headTopY - rightEar.y - .11, '#fff0f2', '#efaebf', true)
      ctx.restore()
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
      drawBlushEffect(ctx, leftBlush, rightBlush, top, leftTemple, rightTemple, now)
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
          ctx.shadowBlur = .025
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
      drawBlushEffect(ctx, leftBlush, rightBlush, top, leftTemple, rightTemple, now)
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
      drawHalo(ctx, 0, top.y - .24, .24, now)
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
      drawHalo(ctx, 0, top.y - .27, .25, now)
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
      drawBow(ctx, leftEarX, leftEar.y + .01, .22 * leftEar.scale, -.14)
      drawBow(ctx, rightEarX, rightEar.y + .01, .22 * rightEar.scale, .14)
      drawBlushEffect(ctx, leftBlush, rightBlush, top, leftTemple, rightTemple, now)
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
        drawAlienEyes(ctx, leftEye, rightEye)
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
      ctx.shadowBlur = .06
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
      drawFittedHat((hatContext, width) => drawWitchHat(hatContext, 0, 0, width))
      drawPumpkin(ctx, .4, top.y + .2, .17)
      drawStar(ctx, -.4, top.y + .1, .05, '#f59a63', now / 700)
      drawStar(ctx, .4, top.y + .1, .05, '#d4a0db', now / 700)
      break
    case 'christmas':
      drawFittedHat((hatContext, width) => drawSantaHat(hatContext, 0, 0, width * .96))
      drawSnowflake(ctx, -.42, top.y + .12 + Math.sin(now / 900) * .025, .09, now / 1600)
      drawSnowflake(ctx, .42, top.y + .2 + Math.cos(now / 1100) * .025, .075, -now / 1400)
      drawStar(ctx, 0, top.y + .17, .024, '#ffedb5', now / 800)
      break
    case 'valentines':
      drawBow(ctx, leftEarX, leftEar.y + .01, .19 * leftEar.scale, -.12)
      drawBow(ctx, rightEarX, rightEar.y + .01, .19 * rightEar.scale, .12)
      drawBlushEffect(ctx, leftBlush, rightBlush, top, leftTemple, rightTemple, now)
      drawHeart(ctx, -.44, top.y + .12 + Math.sin(now / 350) * .03, .05, '#f6a9bc')
      drawHeart(ctx, .44, top.y + .25 + Math.cos(now / 360) * .03, .05, '#f6a9bc')
      break
    case 'birthday':
      drawFittedHat((hatContext, width) => drawPartyHat(hatContext, 0, 0, width * .94, now))
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
  faces.forEach(face => {
    if (face.length < 455) return
    const left = pointAt(face, 234, width, height)
    const right = pointAt(face, 454, width, height)
    const faceWidth = Math.hypot(right.x - left.x, right.y - left.y)
    if (faceWidth < 1) return

    drawFaceEffect(ctx, video, face, effect, width, height, now, advancedFrame !== null)
  })
}
