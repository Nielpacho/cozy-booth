import type { NormalizedLandmark } from '@mediapipe/tasks-vision'
import type { CameraEffectId } from './cameraEffects'

type Point = { x: number; y: number }
type Face = readonly NormalizedLandmark[]

const MAX_FACES = 3

const vertexShader = `
attribute vec2 aPosition;
attribute vec2 aUv;
varying vec2 vUv;

void main() {
  vUv = aUv;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

// All warps work in "metric" space (units of the longest video side) so circles stay circles
// on any aspect ratio, and every radius is derived from the tracked face, so the effect
// scales with how close you are to the camera and rotates with your head.
//
// Per-face uniforms are packed into vec4s to stay inside the 16-vector fragment limit:
//   uEyes[i]      = (leftEye.xy, rightEye.xy)                  uv
//   uMouthFace[i] = (mouth.xy, faceCenter.xy)                  uv
//   uRadii[i]     = (eyeRadius.xy, mouthRadius.xy)             metric
//   uFace[i]      = (faceRadius.xy, faceAngle, unused)         metric / radians
const fragmentShader = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;
uniform sampler2D uVideo;
uniform vec2 uResolution;
uniform int uEffect;
uniform int uFaceCount;
uniform vec4 uEyes[3];
uniform vec4 uMouthFace[3];
uniform vec4 uRadii[3];
uniform vec4 uFace[3];

float maxSide() {
  return max(uResolution.x, uResolution.y);
}

vec2 metric(vec2 uv) {
  return (uv - 0.5) * uResolution / maxSide();
}

vec2 uvDelta(vec2 delta) {
  return delta * maxSide() / uResolution;
}

vec2 rotate2(vec2 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

// Magnifies the area inside a rotated ellipse.
vec2 bulge(vec2 uv, vec2 center, vec2 radius, float angle, float strength) {
  vec2 delta = metric(uv) - metric(center);
  vec2 p = rotate2(delta, -angle) / max(radius, vec2(0.0005));
  float r = length(p);
  if (r >= 1.0) return uv;
  float weight = 1.0 - smoothstep(0.0, 1.0, r);
  vec2 source = rotate2((p / (1.0 + strength * weight)) * radius, angle);
  return uv + uvDelta(source - delta);
}

// Shrinks a rotated ellipse. The flat centre keeps the face evenly scaled instead of pointy.
vec2 pinch(vec2 uv, vec2 center, vec2 radius, float angle, float strength) {
  vec2 delta = metric(uv) - metric(center);
  vec2 p = rotate2(delta, -angle) / max(radius, vec2(0.0005));
  float r = length(p);
  if (r >= 1.0) return uv;
  float weight = 1.0 - smoothstep(0.38, 1.0, r);
  vec2 source = rotate2((p * (1.0 + strength * weight)) * radius, angle);
  return uv + uvDelta(source - delta);
}

void main() {
  vec2 uv = vUv;

  for (int i = 0; i < 3; i++) {
    if (i < uFaceCount) {
      float angle = uFace[i].z;
      if (uEffect == 1) {
        uv = bulge(uv, uEyes[i].xy, uRadii[i].xy, angle, 2.2);
        uv = bulge(uv, uEyes[i].zw, uRadii[i].xy, angle, 2.2);
      } else if (uEffect == 2) {
        uv = bulge(uv, uMouthFace[i].xy, uRadii[i].zw, angle, 1.15);
      } else if (uEffect == 3) {
        uv = pinch(uv, uMouthFace[i].zw, uFace[i].xy, angle, 0.62);
      }
    }
  }

  gl_FragColor = texture2D(uVideo, clamp(uv, 0.001, 0.999));
}
`

// Alien and Robot are painted by the 2D renderer in cameraEffects.ts (it follows the real face
// outline), so only the effects that need to warp pixels run through WebGL.
const effectCode: Partial<Record<CameraEffectId, number>> = {
  'big-eyes': 1,
  'funny-face': 2,
  'tiny-face': 3,
}

const pointAt = (face: Face, index: number): Point => ({
  x: face[index].x,
  y: 1 - face[index].y,
})

const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

const compileShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Could not allocate a face-effects shader.')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Unknown shader compilation error.'
    gl.deleteShader(shader)
    throw new Error(message)
  }
  return shader
}

const createProgram = (gl: WebGLRenderingContext): WebGLProgram => {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader)
  const program = gl.createProgram()
  if (!program) throw new Error('Could not allocate the face-effects renderer.')
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || 'Unknown shader link error.'
    gl.deleteProgram(program)
    throw new Error(message)
  }
  return program
}

export class AdvancedFaceEffectsRenderer {
  readonly canvas = document.createElement('canvas')
  private readonly gl: WebGLRenderingContext
  private readonly program: WebGLProgram
  private readonly texture: WebGLTexture
  private readonly buffer: WebGLBuffer
  private readonly uniforms: Record<string, WebGLUniformLocation>
  private readonly eyes = new Float32Array(MAX_FACES * 4)
  private readonly mouthFace = new Float32Array(MAX_FACES * 4)
  private readonly radii = new Float32Array(MAX_FACES * 4)
  private readonly faceData = new Float32Array(MAX_FACES * 4)
  private disposed = false

  constructor() {
    const gl = this.canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: true,
      premultipliedAlpha: false,
      powerPreference: 'low-power',
    })
    if (!gl) throw new Error('WebGL is not available in this browser.')
    this.gl = gl
    this.program = createProgram(gl)

    const texture = gl.createTexture()
    const buffer = gl.createBuffer()
    if (!texture || !buffer) throw new Error('Could not initialize the face-effects renderer.')
    this.texture = texture
    this.buffer = buffer

    gl.useProgram(this.program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 0, 0,
      1, -1, 1, 0,
      -1, 1, 0, 1,
      1, 1, 1, 1,
    ]), gl.STATIC_DRAW)

    const position = gl.getAttribLocation(this.program, 'aPosition')
    const uv = gl.getAttribLocation(this.program, 'aUv')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 16, 0)
    gl.enableVertexAttribArray(uv)
    gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 16, 8)

    const uniformNames = ['uVideo', 'uResolution', 'uEffect', 'uFaceCount', 'uEyes[0]', 'uMouthFace[0]', 'uRadii[0]', 'uFace[0]']
    this.uniforms = Object.fromEntries(uniformNames.map(name => {
      const location = gl.getUniformLocation(this.program, name)
      if (!location) throw new Error(`Missing face-effects shader uniform: ${name}`)
      return [name, location]
    }))

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.uniform1i(this.uniforms.uVideo, 0)
  }

  render(video: HTMLVideoElement, faces: readonly Face[], effect: CameraEffectId): HTMLCanvasElement | null {
    if (this.disposed || !video.videoWidth || !video.videoHeight) return null
    if (this.gl.isContextLost()) throw new Error('The WebGL context was lost.')
    const code = effectCode[effect]
    if (!code) return null

    const width = video.videoWidth
    const height = video.videoHeight
    const scale = Math.max(width, height)
    // Distance in pixels between two points returned by pointAt (uv, y already flipped).
    const px = (a: Point, b: Point) => Math.hypot((b.x - a.x) * width, (b.y - a.y) * height)

    let count = 0
    for (const face of faces) {
      if (count >= MAX_FACES) break
      if (face.length <= 454) continue

      const cheekLeft = pointAt(face, 234)
      const cheekRight = pointAt(face, 454)
      const faceWidth = px(cheekLeft, cheekRight)
      if (faceWidth < 2) continue

      const forehead = pointAt(face, 10)
      const chin = pointAt(face, 152)
      const faceHeight = Math.max(px(forehead, chin), faceWidth * .6)
      const leftEye = midpoint(pointAt(face, 33), pointAt(face, 133))
      const rightEye = midpoint(pointAt(face, 362), pointAt(face, 263))
      const mouth = midpoint(pointAt(face, 13), pointAt(face, 14))
      const faceCenter = midpoint(forehead, chin)

      // Eye and mouth sizes come from the real landmarks, not from fixed screen constants.
      const eyeWidth = Math.max(
        (px(pointAt(face, 33), pointAt(face, 133)) + px(pointAt(face, 362), pointAt(face, 263))) / 2,
        faceWidth * .1,
      )
      const mouthWidth = Math.max(px(pointAt(face, 61), pointAt(face, 291)), faceWidth * .22)
      const angle = Math.atan2((cheekRight.y - cheekLeft.y) * height, (cheekRight.x - cheekLeft.x) * width)

      const o = count * 4
      this.eyes.set([leftEye.x, leftEye.y, rightEye.x, rightEye.y], o)
      this.mouthFace.set([mouth.x, mouth.y, faceCenter.x, faceCenter.y], o)
      this.radii.set([eyeWidth * 1.1 / scale, eyeWidth * .92 / scale, mouthWidth * .95 / scale, mouthWidth * .78 / scale], o)
      this.faceData.set([faceWidth * .74 / scale, faceHeight * .64 / scale, angle, 0], o)
      count++
    }
    if (!count) return null

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width
      this.canvas.height = height
      this.gl.viewport(0, 0, width, height)
    }

    const gl = this.gl
    gl.useProgram(this.program)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
    gl.uniform2f(this.uniforms.uResolution, width, height)
    gl.uniform1i(this.uniforms.uEffect, code)
    gl.uniform1i(this.uniforms.uFaceCount, count)
    gl.uniform4fv(this.uniforms['uEyes[0]'], this.eyes)
    gl.uniform4fv(this.uniforms['uMouthFace[0]'], this.mouthFace)
    gl.uniform4fv(this.uniforms['uRadii[0]'], this.radii)
    gl.uniform4fv(this.uniforms['uFace[0]'], this.faceData)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    return this.canvas
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    this.gl.deleteTexture(this.texture)
    this.gl.deleteBuffer(this.buffer)
    this.gl.deleteProgram(this.program)
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}