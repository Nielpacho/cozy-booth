import type { NormalizedLandmark } from '@mediapipe/tasks-vision'

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

const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size, size)
  ctx.beginPath()
  ctx.moveTo(0, .35)
  ctx.bezierCurveTo(-.95, -.25, -.45, -.85, 0, -.38)
  ctx.bezierCurveTo(.45, -.85, .95, -.25, 0, .35)
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, rotation = 0) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
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
  ctx.restore()
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
  ctx.fillStyle = color
  ctx.fill()
  ctx.beginPath()
  if (long) ctx.ellipse(0, -.12, .05, .22, 0, 0, Math.PI * 2)
  else {
    ctx.moveTo(-.09, .04)
    ctx.quadraticCurveTo(-.07, -.2, 0, -.19)
    ctx.quadraticCurveTo(.08, -.2, .09, .04)
    ctx.closePath()
  }
  ctx.fillStyle = inner
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
  ctx.fillStyle = '#9b6248'
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(side * .035, .12)
  ctx.bezierCurveTo(side * .15, .04, side * .24, .08, side * .22, .2)
  ctx.bezierCurveTo(side * .2, .3, side * .13, .33, side * .09, .24)
  ctx.closePath()
  ctx.fillStyle = '#d99b7c'
  ctx.fill()
  ctx.restore()
}

const drawAnimalNose = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size = .045) => {
  ctx.save()
  ctx.beginPath()
  ctx.ellipse(x, y, size, size * .72, 0, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x - size * .25, y - size * .22, size * .18, size * .11, -.3, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffffa8'
  ctx.fill()
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

const drawEyeZoom = (ctx: CanvasRenderingContext2D, video: HTMLVideoElement, face: Face, width: number, height: number, toLocal: (p: Point) => Point) => {
  const eyes = [
    midpoint(pointAt(face, 33, width, height), pointAt(face, 133, width, height)),
    midpoint(pointAt(face, 362, width, height), pointAt(face, 263, width, height)),
  ]
  eyes.forEach(eye => {
    const local = toLocal(eye)
    const crop = width * .095
    const diameter = .2
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(local.x, local.y, diameter * .54, diameter * .4, 0, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(video, eye.x - crop / 2, eye.y - crop / 2, crop, crop, local.x - diameter / 2, local.y - diameter / 2, diameter, diameter)
    ctx.restore()
    ctx.save()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = .012
    ctx.beginPath()
    ctx.ellipse(local.x, local.y, diameter * .54, diameter * .4, 0, 0, Math.PI * 2)
    ctx.stroke()
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

const drawFaceEffect = (ctx: CanvasRenderingContext2D, video: HTMLVideoElement, face: Face, effect: CameraEffectId, width: number, height: number, now: number) => {
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
  const leftCheek = toLocal(pointAt(face, 50, width, height))
  const rightCheek = toLocal(pointAt(face, 280, width, height))
  const leftEyeOuter = toLocal(pointAt(face, 33, width, height))
  const rightEyeOuter = toLocal(pointAt(face, 263, width, height))
  const leftEye = toLocal(midpoint(pointAt(face, 33, width, height), pointAt(face, 133, width, height)))
  const rightEye = toLocal(midpoint(pointAt(face, 362, width, height), pointAt(face, 263, width, height)))

  ctx.save()
  ctx.translate(center.x, center.y)
  ctx.rotate(angle)
  ctx.scale(faceWidth, faceWidth)

  const leftEarX = leftEyeOuter.x - .08
  const rightEarX = rightEyeOuter.x + .08
  const earTopY = top.y - .2
  switch (effect) {
    case 'dog':
      drawDogEar(ctx, leftEarX, top.y - .4, -1)
      drawDogEar(ctx, rightEarX, top.y - .4, 1)
      drawDogMuzzle(ctx, nose, mouth, lowerLip, leftMouthCorner, rightMouthCorner, faceWidth)
      drawAnimalNose(ctx, nose.x, nose.y + .025, '#49342e', .05)
      break
    case 'cat':
      drawEar(ctx, leftEarX, earTopY, '#6d5961', '#edb4c5')
      drawEar(ctx, rightEarX, earTopY, '#6d5961', '#edb4c5')
      drawAnimalNose(ctx, nose.x, nose.y + .015, '#d7879c', .028)
      ctx.strokeStyle = '#6d5961'
      ctx.lineWidth = .009
      ;[-1, 1].forEach(side => {
        for (let i = 0; i < 3; i++) {
          ctx.beginPath()
          ctx.moveTo(nose.x + side * .06, nose.y + .06 + i * .035)
          ctx.lineTo(nose.x + side * .36, nose.y + .02 + i * .08)
          ctx.stroke()
        }
      })
      break
    case 'bunny':
      drawEar(ctx, leftEyeOuter.x, earTopY, '#fff0f2', '#efaebf', true)
      drawEar(ctx, rightEyeOuter.x, earTopY, '#fff0f2', '#efaebf', true)
      drawAnimalNose(ctx, nose.x, nose.y + .02, '#e58ba2', .03)
      break
    case 'bear':
      ;[-1, 1].forEach(side => {
        const x = side < 0 ? leftEarX : rightEarX
        ctx.beginPath()
        ctx.arc(x, earTopY, .14, 0, Math.PI * 2)
        ctx.fillStyle = '#9b755e'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, earTopY, .075, 0, Math.PI * 2)
        ctx.fillStyle = '#dfb3a0'
        ctx.fill()
      })
      drawAnimalNose(ctx, nose.x, nose.y + .04, '#705041', .05)
      break
    case 'deer':
      ctx.strokeStyle = '#9c754e'
      ctx.lineWidth = .035
      ctx.lineCap = 'round'
      ;[-1, 1].forEach(side => {
        const x = side < 0 ? leftEarX : rightEarX
        ctx.beginPath()
        ctx.moveTo(x, top.y - .1)
        ctx.lineTo(x + side * .02, top.y - .34)
        ctx.lineTo(x + side * .13, top.y - .41)
        ctx.moveTo(x + side * .02, top.y - .28)
        ctx.lineTo(x - side * .09, top.y - .38)
        ctx.stroke()
      })
      drawAnimalNose(ctx, nose.x, nose.y + .03, '#754c43', .04)
      break
    case 'fox':
      ;[-1, 1].forEach(side => {
        const x = side < 0 ? leftEarX : rightEarX
        ctx.beginPath()
        ctx.moveTo(x - .11, top.y - .1)
        ctx.lineTo(x, top.y - .49)
        ctx.lineTo(x + .11, top.y - .1)
        ctx.closePath()
        ctx.fillStyle = '#e88b55'
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(x - .06, top.y - .13)
        ctx.lineTo(x, top.y - .34)
        ctx.lineTo(x + .06, top.y - .13)
        ctx.closePath()
        ctx.fillStyle = '#f9d5bd'
        ctx.fill()
      })
      drawAnimalNose(ctx, nose.x, nose.y + .035, '#674039', .04)
      break
    case 'blush':
      ;[leftCheek, rightCheek].forEach(cheek => {
        const blush = ctx.createRadialGradient(cheek.x, cheek.y, .015, cheek.x, cheek.y, .13)
        blush.addColorStop(0, '#f0809b88')
        blush.addColorStop(1, '#f0809b00')
        ctx.fillStyle = blush
        ctx.beginPath()
        ctx.ellipse(cheek.x, cheek.y, .14, .09, 0, 0, Math.PI * 2)
        ctx.fill()
      })
      break
    case 'sparkle-face':
    case 'fairy':
      for (let i = 0; i < 7; i++) {
        const pulse = .8 + Math.sin(now / 260 + i) * .2
        const x = Math.sin(i * 9.7) * .49
        const y = top.y + .1 + ((i * 13) % 35) / 100
        drawStar(ctx, x, y, .045 * pulse, effect === 'fairy' ? '#e7c56d' : '#fff1a8', now / 900 + i)
      }
      break
    case 'heart-eyes':
      drawHeart(ctx, leftEye.x, leftEye.y, .105, '#ef7394')
      drawHeart(ctx, rightEye.x, rightEye.y, .105, '#ef7394')
      break
    case 'angel':
      ctx.beginPath()
      ctx.ellipse(0, top.y - .27, .24, .06, 0, Math.PI, Math.PI * 2)
      ctx.strokeStyle = '#e5c46b'
      ctx.lineWidth = .035
      ctx.stroke()
      drawStar(ctx, -.37, top.y - .06, .045, '#ffe7a0')
      drawStar(ctx, .37, top.y - .06, .045, '#ffe7a0')
      break
    case 'coquette':
      drawEmoji(ctx, '🎀', leftEarX, top.y - .16, .23)
      drawEmoji(ctx, '🎀', rightEarX, top.y - .16, .23)
      drawHeart(ctx, -.43, -.02 + Math.sin(now / 400) * .025, .05, '#ef9aae')
      drawHeart(ctx, .43, .14 + Math.cos(now / 430) * .025, .05, '#ef9aae')
      break
    case 'big-eyes':
      drawEyeZoom(ctx, video, face, width, height, toLocal)
      break
    case 'funny-face':
      drawEyeZoom(ctx, video, face, width, height, toLocal)
      drawEmoji(ctx, '😜', mouth.x, mouth.y + .14, .23)
      break
    case 'tiny-face':
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
      drawStar(ctx, -.38, top.y + .08, .045, '#b8e3a8')
      drawStar(ctx, .38, top.y + .08, .045, '#b8e3a8')
      break
    case 'alien':
      ctx.fillStyle = '#89c99c'
      ;[leftEye, rightEye].forEach(eye => {
        ctx.beginPath()
        ctx.ellipse(eye.x, eye.y, .09, .13, 0, 0, Math.PI * 2)
        ctx.fill()
      })
      drawStar(ctx, 0, top.y - .12, .07, '#a7e6bd')
      break
    case 'robot':
      ctx.strokeStyle = '#73aab4'
      ctx.lineWidth = .025
      ctx.fillStyle = '#b7e0df88'
      ctx.beginPath()
      ctx.moveTo(-.28, top.y - .02)
      ctx.quadraticCurveTo(-.38, top.y - .02, -.38, top.y + .08)
      ctx.lineTo(-.38, top.y + .52)
      ctx.quadraticCurveTo(-.38, top.y + .62, -.28, top.y + .62)
      ctx.lineTo(.28, top.y + .62)
      ctx.quadraticCurveTo(.38, top.y + .62, .38, top.y + .52)
      ctx.lineTo(.38, top.y + .08)
      ctx.quadraticCurveTo(.38, top.y - .02, .28, top.y - .02)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ;[leftEye, rightEye].forEach(eye => {
        ctx.beginPath()
        ctx.arc(eye.x, eye.y, .045, 0, Math.PI * 2)
        ctx.fillStyle = '#69bdc4'
        ctx.fill()
      })
      break
    case 'halloween':
      drawEmoji(ctx, '🎃', 0, top.y - .22, .28)
      drawStar(ctx, -.4, top.y + .1, .05, '#f59a63', now / 700)
      drawStar(ctx, .4, top.y + .1, .05, '#d4a0db', now / 700)
      break
    case 'christmas':
      drawEmoji(ctx, '🎅', 0, top.y - .2, .3)
      drawEmoji(ctx, '❄️', -.4, top.y + .15, .12)
      drawEmoji(ctx, '❄️', .4, top.y + .15, .12)
      break
    case 'valentines':
      drawHeart(ctx, leftEarX, top.y - .15, .11, '#f080a0')
      drawHeart(ctx, rightEarX, top.y - .15, .11, '#f080a0')
      drawHeart(ctx, -.44, top.y + .12 + Math.sin(now / 350) * .03, .05, '#f6a9bc')
      drawHeart(ctx, .44, top.y + .25 + Math.cos(now / 360) * .03, .05, '#f6a9bc')
      break
    case 'birthday':
      drawEmoji(ctx, '🥳', 0, top.y - .1, .3)
      for (let i = 0; i < 8; i++) {
        const x = Math.sin(i * 7.3 + now / 1200) * .48
        const y = top.y + .05 + ((i * 19) % 42) / 100
        ctx.fillStyle = ['#f080a0', '#f4c95d', '#87c9b0', '#9d9be8'][i % 4]
        ctx.fillRect(x, y, .025, .04)
      }
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
) => {
  const { videoWidth: width, videoHeight: height } = video
  if (!width || !height) return
  if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
    ctx.canvas.width = width
    ctx.canvas.height = height
  }
  ctx.drawImage(video, 0, 0, width, height)
  if (effect === 'none' || !faces) return
  faces.forEach(face => drawFaceEffect(ctx, video, face, effect, width, height, now))
}
