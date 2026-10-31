import type { NormalizedLandmark } from '@mediapipe/tasks-vision'
import type { CameraEffectId } from './cameraEffects'

type Point = { x: number; y: number }
type Face = readonly NormalizedLandmark[]

const vertexShader = `
attribute vec2 aPosition;
attribute vec2 aUv;
varying vec2 vUv;

void main() {
  vUv = aUv;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const fragmentShader = `
precision mediump float;

varying vec2 vUv;
uniform sampler2D uVideo;
uniform vec2 uResolution;
uniform int uEffect;
uniform int uFaceCount;
uniform vec2 uLeftEye[3];
uniform vec2 uRightEye[3];
uniform vec2 uMouth[3];
uniform vec2 uFaceCenter[3];
uniform vec2 uFaceRadius[3];
uniform float uFaceAngle[3];

vec2 metric(vec2 uv) {
  float scale = max(uResolution.x, uResolution.y);
  return vec2((uv.x - 0.5) * uResolution.x / scale, (uv.y - 0.5) * uResolution.y / scale);
}

vec2 bulge(vec2 uv, vec2 center, vec2 radius, float strength) {
  vec2 delta = metric(uv) - metric(center);
  vec2 safeRadius = max(radius, vec2(0.001));
  float distanceFromCenter = length(delta / safeRadius);
  float weight = 1.0 - smoothstep(0.0, 1.0, distanceFromCenter);
  vec2 source = delta / (1.0 + strength * weight);
  return uv + (source - delta) * max(uResolution.x, uResolution.y) / uResolution;
}

vec2 pinch(vec2 uv, vec2 center, vec2 radius, float strength) {
  vec2 delta = metric(uv) - metric(center);
  vec2 safeRadius = max(radius, vec2(0.001));
  float distanceFromCenter = length(delta / safeRadius);
  float weight = 1.0 - smoothstep(0.0, 1.0, distanceFromCenter);
  vec2 source = delta * (1.0 + strength * weight);
  return uv + (source - delta) * max(uResolution.x, uResolution.y) / uResolution;
}

float faceMask(vec2 uv, vec2 center, vec2 radius, float angle) {
  vec2 delta = metric(uv) - metric(center);
  float cosine = cos(angle);
  float sine = sin(angle);
  vec2 rotated = vec2(cosine * delta.x + sine * delta.y, -sine * delta.x + cosine * delta.y);
  float distanceFromCenter = length(rotated / max(radius, vec2(0.001)));
  return 1.0 - smoothstep(0.84, 1.06, distanceFromCenter);
}

void main() {
  vec2 uv = vUv;
  float scale = max(uResolution.x, uResolution.y);

  if (uEffect == 1) {
    vec2 eyeRadius = vec2(0.105, 0.082) * uResolution / scale;
    for (int i = 0; i < 3; i++) {
      if (i < uFaceCount) {
        uv = bulge(uv, uLeftEye[i], eyeRadius, 2.65);
        uv = bulge(uv, uRightEye[i], eyeRadius, 2.65);
      }
    }
  } else if (uEffect == 2) {
    vec2 mouthRadius = vec2(0.20, 0.15) * uResolution / scale;
    for (int i = 0; i < 3; i++) {
      if (i < uFaceCount) uv = bulge(uv, uMouth[i], mouthRadius, 1.35);
    }
  } else if (uEffect == 3) {
    for (int i = 0; i < 3; i++) {
      if (i < uFaceCount) uv = pinch(uv, uFaceCenter[i], uFaceRadius[i] * 1.08, 0.66);
    }
  }

  vec4 color = texture2D(uVideo, clamp(uv, 0.001, 0.999));

  if (uEffect == 4) {
    float mask = 0.0;
    float alienEye = 0.0;
    for (int i = 0; i < 3; i++) {
      if (i < uFaceCount) {
        mask = max(mask, faceMask(vUv, uFaceCenter[i], uFaceRadius[i], uFaceAngle[i]));
        float leftDistance = length((metric(vUv) - metric(uLeftEye[i])) / vec2(0.055, 0.04));
        float rightDistance = length((metric(vUv) - metric(uRightEye[i])) / vec2(0.055, 0.04));
        alienEye = max(alienEye, 1.0 - smoothstep(0.78, 1.0, min(leftDistance, rightDistance)));
      }
    }
    vec3 alienTint = vec3(color.r * 0.72 + color.g * 0.42, color.g * 1.28 + 0.12, color.b * 0.62 + 0.08);
    color.rgb = mix(color.rgb, alienTint, mask * 0.72);
    color.rgb = mix(color.rgb, vec3(0.018, 0.025, 0.018), alienEye * 0.96);
  } else if (uEffect == 5) {
    for (int i = 0; i < 3; i++) {
      if (i < uFaceCount) {
        float mask = faceMask(vUv, uFaceCenter[i], uFaceRadius[i], uFaceAngle[i]);
        vec2 eyeCenter = (metric(uLeftEye[i]) + metric(uRightEye[i])) * 0.5;
        vec2 delta = metric(vUv) - eyeCenter;
        float cosine = cos(uFaceAngle[i]);
        float sine = sin(uFaceAngle[i]);
        vec2 rotated = vec2(cosine * delta.x + sine * delta.y, -sine * delta.x + cosine * delta.y);
        float visorDistance = max(abs(rotated.x) / 0.39, abs(rotated.y) / 0.105);
        float visorMask = (1.0 - smoothstep(0.94, 1.04, visorDistance)) * mask;
        vec3 glass = mix(vec3(0.035, 0.07, 0.15), vec3(0.20, 0.42, 0.62), clamp(0.55 - rotated.y, 0.0, 1.0));
        color.rgb = mix(color.rgb, glass, visorMask * 0.92);

        float leftLight = 1.0 - smoothstep(0.024, 0.045, length(metric(vUv) - metric(uLeftEye[i])));
        float rightLight = 1.0 - smoothstep(0.024, 0.045, length(metric(vUv) - metric(uRightEye[i])));
        float glow = (leftLight + rightLight) * visorMask;
        color.rgb += vec3(0.03, 0.76, 1.0) * glow * 1.6;
      }
    }
  }

  gl_FragColor = color;
}
`

const effectCode: Partial<Record<CameraEffectId, number>> = {
  'big-eyes': 1,
  'funny-face': 2,
  'tiny-face': 3,
  alien: 4,
  robot: 5,
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

    const uniformNames = ['uVideo', 'uResolution', 'uEffect', 'uFaceCount', 'uLeftEye[0]', 'uRightEye[0]', 'uMouth[0]', 'uFaceCenter[0]', 'uFaceRadius[0]', 'uFaceAngle[0]']
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
    const trackedFaces = faces.slice(0, 3).flatMap(face => {
      if (face.length <= 454) return []
      const left = pointAt(face, 234)
      const right = pointAt(face, 454)
      const faceWidth = Math.hypot((right.x - left.x) * width, (right.y - left.y) * height)
      if (faceWidth < 2) return []
      const forehead = pointAt(face, 10)
      const chin = pointAt(face, 152)
      return [{
        leftEye: midpoint(pointAt(face, 33), pointAt(face, 133)),
        rightEye: midpoint(pointAt(face, 362), pointAt(face, 263)),
        mouth: midpoint(pointAt(face, 13), pointAt(face, 14)),
        center: midpoint(forehead, chin),
        radius: { x: faceWidth / width * .7, y: faceWidth / height * .78 },
        angle: Math.atan2((right.y - left.y) * height, (right.x - left.x) * width),
      }]
    })
    if (!trackedFaces.length) return null

    const canvasWidth = width
    const canvasHeight = height

    if (this.canvas.width !== canvasWidth || this.canvas.height !== canvasHeight) {
      this.canvas.width = canvasWidth
      this.canvas.height = canvasHeight
      this.gl.viewport(0, 0, canvasWidth, canvasHeight)
    }

    const gl = this.gl
    gl.useProgram(this.program)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
    gl.uniform2f(this.uniforms.uResolution, width, height)
    gl.uniform1i(this.uniforms.uEffect, code)
    gl.uniform1i(this.uniforms.uFaceCount, trackedFaces.length)
    gl.uniform2fv(this.uniforms['uLeftEye[0]'], new Float32Array(trackedFaces.flatMap(face => [face.leftEye.x, face.leftEye.y])))
    gl.uniform2fv(this.uniforms['uRightEye[0]'], new Float32Array(trackedFaces.flatMap(face => [face.rightEye.x, face.rightEye.y])))
    gl.uniform2fv(this.uniforms['uMouth[0]'], new Float32Array(trackedFaces.flatMap(face => [face.mouth.x, face.mouth.y])))
    gl.uniform2fv(this.uniforms['uFaceCenter[0]'], new Float32Array(trackedFaces.flatMap(face => [face.center.x, face.center.y])))
    gl.uniform2fv(this.uniforms['uFaceRadius[0]'], new Float32Array(trackedFaces.flatMap(face => [face.radius.x, face.radius.y])))
    gl.uniform1fv(this.uniforms['uFaceAngle[0]'], new Float32Array(trackedFaces.map(face => face.angle)))
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
