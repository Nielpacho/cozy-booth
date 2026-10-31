import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Camera, CameraOff, ChevronLeft, ChevronRight, Check, Download, Film, Heart, ImagePlus, RefreshCw, Settings2, Sparkles, Trash2, Undo2, SwitchCamera, X } from 'lucide-react'
import { FaceLandmarker, FilesetResolver, type NormalizedLandmark } from '@mediapipe/tasks-vision'
import { getStripDesign, stripDesigns, type DesignCategory, type FrameStyle, type StripLayout } from './stripDesigns'
import { cameraEffects, renderCameraFrame, type CameraEffectCategory, type CameraEffectId } from './cameraEffects'
import { AdvancedFaceEffectsRenderer } from './advancedFaceEffects'

type Shot = { id: number; url: string }
type Decor = { id: number; emoji: string; x: number; y: number; size: number; rotation: number }
const photoFilters = [
  { id: 'vintage', name: 'Vintage Filter', css: 'sepia(.38) saturate(.82) contrast(1.05)' },
  { id: 'pastel', name: 'Pastel Filter', css: 'brightness(1.08) saturate(.78) contrast(.92)' },
  { id: 'cinematic', name: 'Cinematic Filter', css: 'contrast(1.18) saturate(.82) brightness(.94)' },
  { id: 'dark-moody', name: 'Dark Moody', css: 'brightness(.78) contrast(1.22) saturate(.82)' },
  { id: 'golden-hour', name: 'Golden Hour', css: 'sepia(.24) saturate(1.35) brightness(1.06)' },
  { id: 'clean-natural', name: 'Clean Natural', css: 'brightness(1.03) saturate(1.04) contrast(1.02)' },
  { id: 'black-white', name: 'Black and White', css: 'grayscale(1) contrast(1.08)' },
  { id: 'dreamy-glow', name: 'Dreamy Glow', css: 'brightness(1.12) saturate(.88) contrast(.94)' },
  { id: 'korean-aesthetic', name: 'Korean Aesthetic', css: 'brightness(1.1) saturate(.72) contrast(.94) sepia(.06)' },
  { id: 'japanese-film', name: 'Japanese Film', css: 'sepia(.2) saturate(.78) contrast(.96) brightness(1.03)' },
  { id: 'retro-90s', name: 'Retro 90s', css: 'sepia(.2) saturate(1.22) contrast(1.08) hue-rotate(-8deg)' },
  { id: 'polaroid', name: 'Polaroid Effect', css: 'sepia(.16) saturate(.86) brightness(1.08) contrast(.96)' },
  { id: 'y2k', name: 'Y2K Filter', css: 'saturate(1.35) contrast(1.08) brightness(1.04) hue-rotate(7deg)' },
  { id: 'disposable-camera', name: 'Disposable Camera', css: 'contrast(1.18) saturate(1.2) brightness(1.04) sepia(.1)' },
  { id: 'soft-blur', name: 'Soft Blur', css: 'blur(.5px) brightness(1.04) saturate(.94)' },
  { id: 'hd-sharp', name: 'HD Sharp', css: 'contrast(1.18) saturate(1.08) brightness(1.01)' },
  { id: 'cool-tone', name: 'Cool Tone', css: 'hue-rotate(8deg) saturate(.92) brightness(1.02)' },
  { id: 'warm-tone', name: 'Warm Tone', css: 'sepia(.16) saturate(1.14) brightness(1.04)' },
  { id: 'faded-film', name: 'Faded Film', css: 'contrast(.82) saturate(.72) brightness(1.12) sepia(.12)' },
  { id: 'grainy-film', name: 'Grainy Film', css: 'sepia(.18) saturate(.86) contrast(1.08)' },
  { id: 'angelic-glow', name: 'Angelic Glow', css: 'brightness(1.16) saturate(.82) contrast(.9)' },
  { id: 'matte', name: 'Matte Filter', css: 'contrast(.84) saturate(.88) brightness(1.08)' },
  { id: 'sunset-orange', name: 'Sunset Orange', css: 'sepia(.28) saturate(1.45) hue-rotate(-8deg) brightness(1.02)' },
  { id: 'blue-hour', name: 'Blue Hour', css: 'hue-rotate(18deg) saturate(.82) brightness(.92) contrast(1.08)' },
  { id: 'soft-focus', name: 'Soft Focus', css: 'blur(.25px) brightness(1.08) contrast(.9) saturate(.9)' },
  { id: 'film-camera', name: 'Film Camera', css: 'sepia(.22) saturate(.92) contrast(1.12) brightness(.98)' },
  { id: 'flash-photography', name: 'Flash Photography', css: 'brightness(1.16) contrast(1.16) saturate(1.08)' },
  { id: 'moody-aesthetic', name: 'Moody Aesthetic', css: 'brightness(.86) contrast(1.16) saturate(.76)' },
  { id: 'soft-vintage', name: 'Soft Vintage', css: 'sepia(.22) saturate(.78) brightness(1.08) contrast(.9)' },
  { id: 'natural-beauty', name: 'Natural Beauty', css: 'brightness(1.04) saturate(.96) contrast(.98)' },
  { id: 'latte', name: 'Latte Filter', css: 'sepia(.26) saturate(.82) brightness(1.04)' },
  { id: 'creamy-beige', name: 'Creamy Beige', css: 'sepia(.18) saturate(.68) brightness(1.1) contrast(.92)' },
  { id: 'milky-white', name: 'Milky White', css: 'brightness(1.17) saturate(.72) contrast(.88)' },
  { id: 'lavender-tone', name: 'Lavender Tone', css: 'hue-rotate(22deg) saturate(.82) brightness(1.04)' },
  { id: 'cloudy-effect', name: 'Cloudy Effect', css: 'brightness(1.06) saturate(.72) contrast(.86)' },
  { id: 'retro-brown', name: 'Retro Brown', css: 'sepia(.42) saturate(.72) contrast(1.05)' },
  { id: 'aesthetic-glow', name: 'Aesthetic Glow', css: 'brightness(1.1) saturate(.96) contrast(.94)' },
  { id: 'dreamy-pink', name: 'Dreamy Pink', css: 'hue-rotate(-12deg) saturate(.88) brightness(1.08)' },
  { id: 'midnight-blue', name: 'Midnight Blue', css: 'hue-rotate(24deg) saturate(.84) brightness(.76) contrast(1.12)' },
  { id: 'warm-film', name: 'Warm Film', css: 'sepia(.2) saturate(1.12) contrast(1.04) brightness(1.02)' },
] as const
type Filter = typeof photoFilters[number]['id']
type ExportFormat = 'png' | 'jpeg'
const filtersPerPage = 4
const filterCss = Object.fromEntries(photoFilters.map(({ id, css }) => [id, css])) as Record<Filter, string>
const cozyStickers = ['💗', '✨', '🎀', '🌷', '☁️', '⭐', '🧸', '♡', '🌼', '🦋', '🤎', '☺️', '💐', '🌸', '🌹', '🍓', '🍒', '🍰', '🫧', '💌', '🐻', '🐰', '🌈', '☀️', '🌙', '💖', '💕', '🪻', '🍡', '🧁', '🪷', '🪻']
const halloweenStickers = ['👻', '🎃', '🦇', '🐈‍⬛', '🧙', '🌙', '⭐', '🍬', '🍭', '🎀', '🖤', '✨', '🕸️', '🕷️', '🧛', '🧟', '🧹', '🪄', '🧪', '💀', '🦴', '🕯️', '🌑', '🧡', '🍂', '🍁', '🦉', '🐈', '🪦', '🥀', '🦇', '👁️']
const christmasStickers = ['🎄', '❄️', '🎅', '🍬', '🍪', '🔔', '🔴', '🎁', '⭐', '🎀', '✨', '🦌', '⛄', '☃️', '🧦', '🛷', '🕯️', '🌟', '🪽', '🧤', '🧣', '🍭', '🍫', '🥛', '🌲', '🛎️', '💝', '❤️', '🤍', '🧑‍🎄', '🦌', '🪅']

const isAppleMobile = () => {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

const roundedRectPath = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2))
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null)
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)
  const faceLandmarkerLoadingRef = useRef<Promise<FaceLandmarker> | null>(null)
  const advancedFaceEffectsRef = useRef<AdvancedFaceEffectsRenderer | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recordingCompletedRef = useRef(false)
  const videoSessionCompleteRef = useRef(false)
  const videoUrlRef = useRef<string | null>(null)
  const videoBlobRef = useRef<Blob | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawSequenceRef = useRef(0)
  const previewRef = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [facing, setFacing] = useState<'user' | 'environment'>('user')
  const [cameraError, setCameraError] = useState('')
  const [cameraEffect, setCameraEffect] = useState<CameraEffectId>('none')
  const [cameraEffectCategory, setCameraEffectCategory] = useState<CameraEffectCategory>('all')
  const [cameraEffectError, setCameraEffectError] = useState('')
  const [cameraEffectStatus, setCameraEffectStatus] = useState('')
  const [shots, setShots] = useState<Shot[]>([])
  const [count, setCount] = useState(4)
  const [seconds, setSeconds] = useState(3)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState<Filter>('pastel')
  const [filterPage, setFilterPage] = useState(0)
  const [bg, setBg] = useState('#f9e4e8')
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('rounded')
  const [selectedDesign, setSelectedDesign] = useState('coquette-pink')
  const [designCategory, setDesignCategory] = useState<'all' | DesignCategory>('all')
  const [designPage, setDesignPage] = useState(0)
  const [caption, setCaption] = useState('made with love ♡')
  const [title, setTitle] = useState('Coquette Pink')
  const [layout, setLayout] = useState<StripLayout>('vertical')
  const [stripPadding, setStripPadding] = useState(34)
  const [photoSpacing, setPhotoSpacing] = useState(15)
  const [captionColor, setCaptionColor] = useState('#b85f79')
  const [captionFontSize, setCaptionFontSize] = useState(16)
  const [captionFontStyle, setCaptionFontStyle] = useState<'normal' | 'italic' | 'bold'>('italic')
  const [captionAlignment, setCaptionAlignment] = useState<CanvasTextAlign>('center')
  const [captionOffset, setCaptionOffset] = useState(0)
  const [decorations, setDecorations] = useState<Decor[]>([])
  const [selectedDecorationId, setSelectedDecorationId] = useState<number | null>(null)
  const [selectedEmoji, setSelectedEmoji] = useState('💗')
  const [stickerCategory, setStickerCategory] = useState<DesignCategory>('cozy')
  const [dragging, setDragging] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'design' | 'stickers'>('design')
  const [notice, setNotice] = useState('')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoExtension, setVideoExtension] = useState('webm')
  const [videoRecording, setVideoRecording] = useState(false)
  const appleMobile = isAppleMobile()

  const clearVideo = useCallback(() => {
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current)
    videoUrlRef.current = null
    videoBlobRef.current = null
    setVideoUrl(null)
  }, [])

  const stopVideoRecording = useCallback((completed: boolean) => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    recordingCompletedRef.current = completed
    recorder.stop()
  }, [])

  const startVideoRecording = useCallback(() => {
    const stream = streamRef.current
    if (!stream) return
    if (recorderRef.current && recorderRef.current.state !== 'inactive') return
    if (typeof MediaRecorder === 'undefined') {
      setCameraError('Video recording is not supported in this browser. You can still take photos.')
      return
    }

    const supportedTypes = appleMobile
      ? ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp8', 'video/webm']
      : ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp8', 'video/webm', 'video/webm;codecs=vp9']
    const mimeType = typeof MediaRecorder.isTypeSupported === 'function'
      ? supportedTypes
        .find(type => MediaRecorder.isTypeSupported(type))
      : undefined

    try {
      clearVideo()
      recordedChunksRef.current = []
      recordingCompletedRef.current = false
      videoSessionCompleteRef.current = false
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }
      recorder.onstop = () => {
        const completed = recordingCompletedRef.current
        recordingCompletedRef.current = false
        videoSessionCompleteRef.current = completed
        recorderRef.current = null
        setVideoRecording(false)
        const chunks = recordedChunksRef.current
        if (completed && chunks.length) {
          const actualType = recorder.mimeType || chunks.find(chunk => chunk.type)?.type || ''
          const mimeType = actualType.split(';')[0].toLowerCase()
          const extension = mimeType === 'video/mp4' ? 'mp4' : mimeType === 'video/webm' ? 'webm' : ''
          const blob = new Blob(chunks, { type: mimeType })
          if (blob.size > 0 && extension) {
            const url = URL.createObjectURL(blob)
            videoUrlRef.current = url
            videoBlobRef.current = blob
            setVideoUrl(url)
            setVideoExtension(extension)
            setCameraError('')
          } else {
            console.error('Video recording returned an unsupported format:', actualType)
            setCameraError('Your browser recorded the session in an unsupported video format. Your photos are still available.')
          }
        } else if (completed) {
          console.error('Video recording completed without any video data.')
          setCameraError('The video recording was empty. Your photos are still available; please try again.')
        }
        recordedChunksRef.current = []
      }
      recorder.onerror = () => {
        recordingCompletedRef.current = false
        setCameraError('Video recording stopped unexpectedly. Your photos are still available.')
      }
      recorder.start(1000)
      recorderRef.current = recorder
      setVideoRecording(true)
    } catch (error) {
      console.error('Video recording error:', error)
      setCameraError('Video recording could not start. You can still take photos.')
    }
  }, [appleMobile, clearVideo])

  const stopCamera = useCallback(() => {
    stopVideoRecording(false)
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
  }, [stopVideoRecording])

  const startCamera = useCallback(async (mode = facing) => {
    setCameraError('')
    stopCamera()
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is not supported in this browser. Try the latest Chrome, Edge, or Safari.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      // Keep the stream until the video element is mounted and ready.
      streamRef.current = stream
      setCameraOn(true)
      setStarted(true)
    } catch (error) {
      const e = error as DOMException
      setCameraError(e.name === 'NotAllowedError'
        ? 'Camera permission was blocked. Allow camera access in your browser settings, then try again.'
        : e.name === 'NotFoundError'
          ? 'No camera was found. Connect a camera and try again.'
          : 'We could not start your camera. Check that no other app is using it.')
    }
  }, [facing, stopCamera])

  // Attach the camera stream after React has rendered the video element.
  useEffect(() => {
    const video = videoRef.current
    const stream = streamRef.current

    if (!cameraOn || !video || !stream) return

    video.srcObject = stream
    video.play().catch(error => {
      console.error('Camera playback error:', error)
      setCameraError('Camera connected, but the preview could not start. Please reload and try again.')
    })

    return () => {
      video.pause()
      video.srcObject = null
    }
  }, [cameraOn])

  const loadFaceLandmarker = useCallback(async () => {
    if (faceLandmarkerRef.current) return faceLandmarkerRef.current
    if (!faceLandmarkerLoadingRef.current) {
      faceLandmarkerLoadingRef.current = (async () => {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm',
        )
        const options = {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU' as const,
          },
          runningMode: 'VIDEO' as const,
          numFaces: 3,
          outputFaceBlendshapes: false,
        }
        let landmarker: FaceLandmarker
        try {
          landmarker = await FaceLandmarker.createFromOptions(vision, options)
        } catch (gpuError) {
          console.warn('GPU face tracking is unavailable; using CPU tracking instead.', gpuError)
          landmarker = await FaceLandmarker.createFromOptions(vision, {
            ...options,
            baseOptions: { ...options.baseOptions, delegate: 'CPU' },
          })
        }
        faceLandmarkerRef.current = landmarker
        return landmarker
      })()
    }

    try {
      return await faceLandmarkerLoadingRef.current
    } catch (error) {
      faceLandmarkerLoadingRef.current = null
      throw error
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    const canvas = cameraCanvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!cameraOn || !video || !canvas || !ctx) return

    let active = true
    let animationFrame = 0
    let detector = faceLandmarkerRef.current
    let lastDetection = 0
    let lastStatusUpdate = 0
    let faces: NormalizedLandmark[][] = []
    let effectRenderingFailed = false

    setCameraEffectError('')
    if (cameraEffect === 'none') {
      setCameraEffectStatus('Camera frames stay on your device.')
      return
    }

    const gpuEffect = ['big-eyes', 'funny-face', 'tiny-face', 'alien', 'robot'].includes(cameraEffect)
    if (gpuEffect && !advancedFaceEffectsRef.current) {
      try {
        advancedFaceEffectsRef.current = new AdvancedFaceEffectsRenderer()
      } catch (error) {
        console.error('Advanced face effects could not start; using the built-in renderer instead:', error)
        setCameraEffectStatus('Advanced GPU effects are unavailable; using the built-in face effect.')
      }
    }

    setCameraEffectStatus('Loading face tracking…')
    void loadFaceLandmarker().then(landmarker => {
      if (active) {
        detector = landmarker
        setCameraEffectStatus(gpuEffect && !advancedFaceEffectsRef.current
          ? 'Face tracking ready · using the built-in face effect'
          : 'Face tracking ready · processed on your device')
      }
    }).catch(error => {
      console.error('Face tracking could not start:', error)
      if (active) {
        setCameraEffectError('Face tracking could not load. Check your internet connection, then try selecting the effect again.')
        setCameraEffectStatus('Live camera is still available without face tracking.')
      }
    })

    const renderFrame = (now: number) => {
      if (!active) return
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth) {
        if (detector && now - lastDetection >= 67) {
          try {
            const detectedFaces = detector.detectForVideo(video, now).faceLandmarks
            faces = detectedFaces.map((face, faceIndex) => face.map((landmark, landmarkIndex) => {
              const previous = faces[faceIndex]?.[landmarkIndex]
              return previous
                ? { ...landmark, x: previous.x * .35 + landmark.x * .65, y: previous.y * .35 + landmark.y * .65 }
                : landmark
            }))
            lastDetection = now
            if (now - lastStatusUpdate > 800) {
              setCameraEffectStatus(faces.length
                ? `Tracking ${faces.length} face${faces.length === 1 ? '' : 's'} · processed on your device`
                : 'No face found yet · move into the camera view')
              lastStatusUpdate = now
            }
          } catch (error) {
            console.error('Face tracking failed:', error)
            detector = null
            faces = []
            setCameraEffectError('Face tracking stopped unexpectedly. The camera still works; choose No Effect or try again.')
          }
        }
        if (effectRenderingFailed) {
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        } else {
          try {
            let advancedFrame: HTMLCanvasElement | null = null
            if (gpuEffect && advancedFaceEffectsRef.current) {
              try {
                advancedFrame = advancedFaceEffectsRef.current.render(video, faces, cameraEffect)
              } catch (error) {
                console.error('Advanced face-effect rendering failed; using the built-in renderer instead:', error)
                advancedFaceEffectsRef.current.dispose()
                advancedFaceEffectsRef.current = null
                setCameraEffectStatus('Advanced GPU effects stopped; using the built-in face effect.')
              }
            }
            renderCameraFrame(ctx, video, faces, cameraEffect, now, advancedFrame)
          } catch (error) {
            console.error('Camera effect rendering failed:', error)
            effectRenderingFailed = true
            faces = []
            setCameraEffect('none')
            setCameraEffectError('This effect could not render on your device, so it was turned off. Your live camera is still working.')
            setCameraEffectStatus('Choose another effect to try again.')
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
          }
        }
      }
      animationFrame = window.requestAnimationFrame(renderFrame)
    }

    animationFrame = window.requestAnimationFrame(renderFrame)
    return () => {
      active = false
      window.cancelAnimationFrame(animationFrame)
    }
  }, [cameraEffect, cameraOn, loadFaceLandmarker])

  useEffect(() => {
    if (!cameraOn) return
    return () => {
      advancedFaceEffectsRef.current?.dispose()
      advancedFaceEffectsRef.current = null
    }
  }, [cameraOn])

  useEffect(() => () => {
    recordingCompletedRef.current = false
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop()
    streamRef.current?.getTracks().forEach(track => track.stop())
    faceLandmarkerRef.current?.close()
    faceLandmarkerRef.current = null
    advancedFaceEffectsRef.current?.dispose()
    advancedFaceEffectsRef.current = null
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current)
  }, [])

  const takePhoto = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return false
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    if (facing === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    const compositedFrame = cameraEffect === 'none' ? null : cameraCanvasRef.current
    if (compositedFrame?.width && compositedFrame.height) {
      ctx.drawImage(compositedFrame, 0, 0, canvas.width, canvas.height)
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    }
    const url = canvas.toDataURL('image/jpeg', .94)
    setShots(prev => [...prev, { id: Date.now() + Math.random(), url }])
    return true
  }, [cameraEffect, facing])

  const beginCapture = async () => {
    if (!cameraOn) { await startCamera(); return }
    if (busy || shots.length >= count) return
    if (!videoRecording && (shots.length === 0 || videoUrl || videoSessionCompleteRef.current)) startVideoRecording()
    setBusy(true)
    try {
      for (let n = seconds; n >= 1; n--) {
        setCountdown(n)
        await new Promise(resolve => window.setTimeout(resolve, 1000))
      }
      setCountdown(0)
      await new Promise(resolve => window.setTimeout(resolve, 350))
      const captured = takePhoto()
      if (captured && shots.length + 1 >= count) stopVideoRecording(true)
    } finally {
      setCountdown(null)
      setBusy(false)
    }
  }

  const captureRemaining = shots.length < count
  const addDecoration = (emoji: string) => {
    const id = Date.now() + Math.random()
    setDecorations(prev => [...prev, { id, emoji, x: 86, y: 94, size: 30, rotation: 0 }])
    setSelectedDecorationId(id)
  }

  const currentDesign = getStripDesign(selectedDesign)
  const designsPerPage = 4
  const filteredDesigns = designCategory === 'all' ? stripDesigns : stripDesigns.filter(design => design.category === designCategory)
  const designPageCount = Math.ceil(filteredDesigns.length / designsPerPage)
  const visibleDesigns = filteredDesigns.slice(designPage * designsPerPage, (designPage + 1) * designsPerPage)
  const stickerLibraries: Record<DesignCategory, string[]> = {
    cozy: cozyStickers,
    halloween: halloweenStickers,
    christmas: christmasStickers,
  }
  const availableStickers = [...new Set(stickerLibraries[stickerCategory])]
  const visibleCameraEffects = cameraEffects.filter(effect =>
    effect.id === 'none' || cameraEffectCategory === 'all' || effect.category === cameraEffectCategory,
  )

  const stripDimensions = useMemo(() => {
    const rows = layout === 'vertical' ? count : Math.ceil(count / 2)
    const gridHeight = layout === 'vertical' ? count * 420 : rows * 190
    return { width: 600, height: Math.round(stripPadding * 2 + gridHeight + 112 + photoSpacing * Math.max(0, rows - 1)) }
  }, [count, layout, photoSpacing, stripPadding])

  const chooseDesign = (designId: string) => {
    const design = getStripDesign(designId)
    setSelectedDesign(design.id)
    setDesignCategory(design.category)
    const categoryDesigns = stripDesigns.filter(item => item.category === design.category)
    setDesignPage(Math.floor(categoryDesigns.findIndex(item => item.id === design.id) / designsPerPage))
    setBg(design.background)
    setFrameStyle(design.frameStyle)
    setStripPadding(design.padding)
    setPhotoSpacing(design.spacing)
    setCaption(design.caption)
    setTitle(design.name)
    const designFilter = ({ natural: 'clean-natural', warm: 'warm-tone', pastel: 'pastel', mono: 'black-white', retro: 'vintage', glow: 'dreamy-glow' } as const)[design.filter]
    setFilter(designFilter)
    setFilterPage(Math.floor(photoFilters.findIndex(item => item.id === designFilter) / filtersPerPage))
    setCaptionColor(design.accent)
    setCaptionFontSize(16)
    setCaptionFontStyle(design.fontStyle === 'normal' ? 'normal' : 'italic')
    setCaptionAlignment('center')
    setCaptionOffset(0)
  }

  const resetDesign = () => {
    chooseDesign(selectedDesign)
    setDecorations([])
    setSelectedDecorationId(null)
  }

  const drawStrip = useCallback(async () => {
    const sequence = ++drawSequenceRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = stripDimensions.width
    const H = stripDimensions.height
    canvas.width = W
    canvas.height = H
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)
    const pad = stripPadding
    const gap = photoSpacing
    const footer = 104
    const columns = layout === 'vertical' ? 1 : 2
    const rows = Math.ceil(count / columns)
    const photoW = (W - pad * 2 - gap * (columns - 1)) / columns
    const photoH = (H - pad * 2 - footer - gap * (rows - 1)) / rows
    const borderWidth = frameStyle === 'minimal' ? Math.max(1, currentDesign.borderThickness) : currentDesign.borderThickness

    if (currentDesign.texture === 'paper') {
      ctx.save()
      ctx.globalAlpha = .1
      ctx.strokeStyle = currentDesign.accent
      ctx.lineWidth = 1
      for (let y = 12; y < H; y += 24) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }
      ctx.restore()
    }

    for (let i = 0; i < count; i++) {
      const shot = shots[i]
      const column = i % columns
      const row = Math.floor(i / columns)
      const x = pad + column * (photoW + gap)
      const y = pad + row * (photoH + gap)
      const frameX = x - borderWidth
      const frameY = y - borderWidth
      const frameW = photoW + borderWidth * 2
      const frameH = photoH + borderWidth * 2
      const radius = frameStyle === 'minimal' || frameStyle === 'film'
        ? 0
        : frameStyle === 'rounded'
          ? currentDesign.borderRadius
          : Math.min(currentDesign.borderRadius, 6)

      ctx.save()
      roundedRectPath(ctx, frameX, frameY, frameW, frameH, radius + borderWidth)
      ctx.fillStyle = currentDesign.borderColors?.[i % currentDesign.borderColors.length] ?? currentDesign.frameColor
      ctx.fill()
      if (frameStyle === 'botanical') {
        ctx.strokeStyle = currentDesign.accent
        ctx.lineWidth = Math.max(1, borderWidth / 2)
        ctx.setLineDash([5, 5])
        roundedRectPath(ctx, frameX + 2, frameY + 2, frameW - 4, frameH - 4, radius + borderWidth)
        ctx.stroke()
        ctx.setLineDash([])
      }
      ctx.restore()
      if (shot) {
        const img = new Image()
        img.src = shot.url
        await new Promise<void>(resolve => { img.onload = () => resolve(); img.onerror = () => resolve() })
        ctx.save()
        roundedRectPath(ctx, x, y, photoW, photoH, radius)
        ctx.clip()
        ctx.filter = filterCss[filter]
        const scale = Math.max(photoW / img.width, photoH / img.height)
        const sw = photoW / scale, sh = photoH / scale
        ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, photoW, photoH)
        ctx.restore()
      } else {
        roundedRectPath(ctx, x, y, photoW, photoH, radius)
        ctx.save()
        ctx.clip()
        ctx.fillStyle = '#eadfd2'
        ctx.fillRect(x, y, photoW, photoH)
        ctx.fillStyle = '#9a8270'
        ctx.textAlign = 'center'
        ctx.font = '22px sans-serif'
        ctx.fillText('your photo goes here', x + photoW / 2, y + photoH / 2, photoW - 20)
        ctx.restore()
      }

      if (frameStyle === 'film') {
        ctx.save()
        ctx.fillStyle = currentDesign.accent
        for (let holeY = frameY + 8; holeY < frameY + frameH - 5; holeY += 18) {
          ctx.fillRect(frameX + 3, holeY, Math.max(2, borderWidth - 5), 7)
          ctx.fillRect(frameX + frameW - borderWidth + 2, holeY, Math.max(2, borderWidth - 5), 7)
        }
        ctx.restore()
      }
    }

    if (currentDesign.texture === 'grain') {
      ctx.save()
      ctx.fillStyle = currentDesign.accent
      ctx.globalAlpha = .12
      for (let i = 0; i < 260; i++) {
        const x = (i * 193 + 37) % W
        const y = (i * 317 + 71) % H
        ctx.fillRect(x, y, i % 3 === 0 ? 2 : 1, 1)
      }
      ctx.restore()
    }

    ctx.fillStyle = captionColor
    ctx.textAlign = captionAlignment
    ctx.textBaseline = 'middle'
    const textX = captionAlignment === 'left' ? pad : captionAlignment === 'right' ? W - pad : W / 2
    const fontStyle = captionFontStyle === 'italic' ? 'italic ' : ''
    const fontWeight = captionFontStyle === 'bold' ? '700' : '600'
    ctx.font = `${fontStyle}${fontWeight} 19px ${currentDesign.fontFamily}`
    if (title.trim()) ctx.fillText(title.trim().slice(0, 32), textX, H - 74, W - pad * 2)
    if (caption.trim()) {
      ctx.font = `${fontStyle}${fontWeight} ${captionFontSize}px ${currentDesign.fontFamily}`
      ctx.fillText(caption.trim().slice(0, 64), textX, H - 45 + captionOffset, W - pad * 2)
    }
    if (['vintage-film', 'film-diary', 'mono'].includes(currentDesign.id)) {
      ctx.font = '12px "DM Sans", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(new Date().toLocaleDateString(), W / 2, H - 18)
    }

    if (currentDesign.texture === 'sparkle' || currentDesign.decorations.length) {
      ctx.save()
      ctx.fillStyle = currentDesign.accent
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '17px serif'
      for (let row = 0; row < rows; row++) {
        const centerY = pad + row * (photoH + gap) + photoH / 2
        ctx.fillText(currentDesign.decorations[row % currentDesign.decorations.length] ?? '✦', pad / 2, centerY)
        ctx.fillText(currentDesign.decorations[(row + 1) % currentDesign.decorations.length] ?? '✦', W - pad / 2, centerY)
      }
      if (currentDesign.texture === 'sparkle') {
        ctx.font = '15px serif'
        ctx.fillText('✦', pad / 2, pad / 2)
        ctx.fillText('✧', W - pad / 2, H - footer + 7)
      }
      ctx.restore()
    }

    decorations.forEach(d => {
      ctx.save()
      const size = Math.min(d.size * 1.7, 72)
      const x = Math.max(size / 2, Math.min(W - size / 2, W * d.x / 100))
      const y = Math.max(size / 2, Math.min(H - size / 2, H * d.y / 100))
      ctx.translate(x, y)
      ctx.rotate(d.rotation * Math.PI / 180)
      ctx.font = `${size}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(d.emoji, 0, 0)
      ctx.restore()
    })
    if (sequence === drawSequenceRef.current && canvasRef.current) {
      const previewCanvas = canvasRef.current
      previewCanvas.width = W
      previewCanvas.height = H
      previewCanvas.getContext('2d')?.drawImage(canvas, 0, 0)
    }
    return canvas
  }, [bg, caption, captionAlignment, captionColor, captionFontSize, captionFontStyle, captionOffset, count, currentDesign, decorations, filter, frameStyle, layout, photoSpacing, shots, stripDimensions, stripPadding, title])

  useEffect(() => { void drawStrip() }, [drawStrip])

  const download = async () => {
    try {
      const canvas = await drawStrip()
      if (!canvas) return
      const mimeType = exportFormat === 'png' ? 'image/png' : 'image/jpeg'
      const blob = await new Promise<Blob | null>(resolve => {
        canvas.toBlob(resolve, mimeType, exportFormat === 'jpeg' ? .94 : undefined)
      })
      if (!blob) {
        setNotice(`Could not create the ${exportFormat.toUpperCase()} download. Please try again.`)
        return
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `cozy-booth-photo-strip.${exportFormat === 'jpeg' ? 'jpg' : 'png'}`
      link.href = url
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice(`Your lovely memories are ready as ${exportFormat.toUpperCase()}! ♡`)
    } catch (error) {
      console.error('Photo strip export error:', error)
      setNotice('The photo strip could not be downloaded. Please try again.')
    }
  }

  const downloadVideo = async () => {
    const blob = videoBlobRef.current
    const url = videoUrlRef.current
    if (!blob || !url) return

    const filename = `cozy-booth-photo-session.${videoExtension}`
    const type = blob.type
    const file = new File([blob], filename, { type })

    if (appleMobile && typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Cozy Booth photo session' })
        setNotice('Choose “Save Video” in the share sheet to add it to Photos.')
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.error('Video share error:', error)
        setNotice('Could not open the share sheet. Use “Open video” and save it from the video player instead.')
      }
      return
    }

    const link = document.createElement('a')
    link.href = url
    if (appleMobile) {
      link.target = '_blank'
      link.rel = 'noopener'
    } else {
      link.download = filename
    }
    link.type = type
    link.hidden = true
    document.body.appendChild(link)
    link.click()
    link.remove()
    setNotice(appleMobile
      ? 'Video opened in a new tab. Tap Share, then choose “Save Video” or “Save to Files”.'
      : 'Your video download has started.')
  }

  const reset = () => {
    stopVideoRecording(false)
    videoSessionCompleteRef.current = false
    clearVideo()
    setShots([])
    setDecorations([])
    setSelectedDecorationId(null)
    setNotice('')
    setCountdown(null)
  }

  const pointerDown = (e: React.PointerEvent, id: number) => {
    setDragging(id)
    setSelectedDecorationId(id)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const pointerMove = (e: React.PointerEvent) => {
    if (dragging === null || !previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100))
    setDecorations(prev => prev.map(d => d.id === dragging ? { ...d, x, y } : d))
  }
  const pointerUp = () => setDragging(null)

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">♡</span><span>cozy booth</span></a>
        <span className="top-tagline">little moments, lovely memories.</span>
        <a className="top-link" href="#studio">let's make memories <span>✿</span></a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={14}/> YOUR LITTLE PHOTO CORNER</span>
            <h1>Memories look<br/><em>better together.</em></h1>
            <p>A tiny online photobooth for your favorite people, silly faces, and sweetest little moments.</p>
            <button className="primary-btn" onClick={() => document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' })}>
              <Camera size={18}/> Start photobooth <span>↗</span>
            </button>
            <div className="hero-note"><span>✦</span> Free to use · No account needed · Photos stay on your device</div>
          </div>
          <div className="hero-art">
            <div className="sparkle s1">✧</div><div className="sparkle s2">✳</div>
            <div className="sample-strip">
              <div className="sample-photo sample-one"><span>☺</span></div>
              <div className="sample-photo sample-two"><span>♡</span></div>
              <div className="sample-photo sample-three"><span>✿</span></div>
              <div className="sample-photo sample-four"><span>✦</span></div>
              <div className="sample-footer">COZY BOOTH<small>little moments ♡</small></div>
            </div>
            <div className="floating-note">made with<br/>a little love <Heart size={14} fill="currentColor"/></div>
          </div>
        </section>

        <section id="studio" className="studio-section">
          <div className="section-heading">
            <span className="eyebrow">✿ THE PHOTO STUDIO</span>
            <h2>Let's make something <em>lovely.</em></h2>
            <p>Set your camera, take your shots, then decorate your strip.</p>
          </div>

          <div className="studio-grid">
            <section className="panel camera-panel">
              <div className="panel-heading"><div><span className="step">01</span><h3>Camera studio</h3></div><span className={`status ${cameraOn ? 'online' : ''}`}><i/> {cameraOn ? 'camera ready' : 'not connected'}</span></div>
              <div className="camera-window">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`camera-video ${cameraEffect === 'none' ? 'camera-live' : 'camera-source'} ${facing === 'user' ? 'mirrored' : ''}`}
                  style={{ display: cameraOn ? 'block' : 'none' }}
                />
                <canvas
                  ref={cameraCanvasRef}
                  className={`camera-composite ${facing === 'user' ? 'mirrored' : ''}`}
                  style={{ display: cameraOn && cameraEffect !== 'none' ? 'block' : 'none' }}
                  aria-label="Live camera preview with selected effect"
                />
                {!cameraOn && <div className="camera-placeholder"><div className="camera-icon"><CameraOff size={30}/></div><strong>Your camera goes here</strong><span>Allow camera access when you're ready ♡</span></div>}
                {countdown !== null && <div className="countdown-overlay"><span>{countdown === 0 ? '✦' : countdown}</span><small>get ready!</small></div>}
                <span className="camera-corner">LIVE PREVIEW</span>
              </div>
              <section className="camera-effects" aria-label="Camera effects">
                <div className="camera-effects-heading">
                  <div><strong>Face effects</strong><span>Pick one to preview it live</span></div>
                  {cameraEffect !== 'none' && <button type="button" className="clear-effect" onClick={() => setCameraEffect('none')}><X size={13}/> Clear</button>}
                </div>
                <div className="camera-effect-categories" aria-label="Effect categories">
                  {(['all', 'animals', 'cute', 'funny', 'seasonal'] as const).map(category => (
                    <button
                      type="button"
                      key={category}
                      className={cameraEffectCategory === category ? 'active' : ''}
                      aria-pressed={cameraEffectCategory === category}
                      onClick={() => setCameraEffectCategory(category)}
                    >{category === 'all' ? 'All' : category[0].toUpperCase() + category.slice(1)}</button>
                  ))}
                </div>
                <div className="camera-effect-list" role="group" aria-label="Choose a camera effect">
                  {visibleCameraEffects.map(effect => (
                    <button
                      type="button"
                      key={effect.id}
                      className={`camera-effect-card ${cameraEffect === effect.id ? 'selected' : ''}`}
                      aria-pressed={cameraEffect === effect.id}
                      onClick={() => setCameraEffect(effect.id)}
                    >
                      <span className="camera-effect-icon" aria-hidden="true">{effect.icon}</span>
                      <span className="camera-effect-name">{effect.name}</span>
                      {cameraEffect === effect.id && <span className="camera-effect-check"><Check size={11}/></span>}
                    </button>
                  ))}
                </div>
                <p className={`camera-effects-status ${cameraEffectError ? 'has-error' : ''}`} aria-live="polite">
                  {cameraEffectError || cameraEffectStatus || (cameraOn ? 'Camera frames stay on your device.' : 'Choose an effect, then enable the camera to try it.')}
                </p>
                <p className="camera-effects-privacy">Face tracking runs locally in your browser. The model loads when you first choose an effect; camera images are never uploaded.</p>
              </section>
              {cameraError && <div className="error-box">{cameraError}</div>}
              <div className="camera-settings">
                <label>PHOTOS PER STRIP<select value={count} disabled={busy || videoRecording} onChange={e => { const nextCount = Number(e.target.value); setCount(nextCount); setShots(current => current.slice(0, nextCount)) }}><option value={2}>2 photos</option><option value={3}>3 photos</option><option value={4}>4 photos</option></select></label>
                <label>COUNTDOWN<select value={seconds} disabled={busy} onChange={e => setSeconds(Number(e.target.value))}><option value={3}>3 seconds</option><option value={5}>5 seconds</option><option value={10}>10 seconds</option></select></label>
              </div>
              <div className="capture-progress"><div className="progress-label"><span>PHOTO PROGRESS</span><strong>{shots.length} / {count}</strong></div><div className="progress-track"><div style={{ width: `${shots.length / count * 100}%` }}/></div></div>
              <div className="capture-actions">
                <button className="primary-btn capture-btn" disabled={busy || (!cameraOn && false) || !captureRemaining} onClick={beginCapture}><Camera size={17}/>{cameraOn ? (busy ? 'Get ready…' : captureRemaining ? 'Take a photo' : 'All photos taken!') : 'Enable camera'}</button>
                <button className="icon-btn" disabled={busy || videoRecording} title="Switch camera" aria-label="Switch camera" onClick={() => { const next = facing === 'user' ? 'environment' : 'user'; setFacing(next); if (cameraOn) void startCamera(next) }}><SwitchCamera size={18}/></button>
              </div>
              <div className="small-actions">
                <button onClick={() => setShots(s => s.slice(0, -1))} disabled={!shots.length || busy}><Undo2 size={14}/> Undo last photo</button>
                <button onClick={reset} disabled={(!shots.length && !decorations.length) || busy || videoRecording}><RefreshCw size={14}/> Retake all</button>
                <button onClick={stopCamera} disabled={!cameraOn || busy || videoRecording}><CameraOff size={14}/> Turn camera off</button>
              </div>
              {videoRecording && <div className="recording-note"><i/> Recording the photo session — it will stop when your strip is complete.</div>}
            </section>

            <section className="panel editor-panel">
              <div className="panel-heading"><div><span className="step">02</span><h3>Your photo strip</h3></div><span className="live-label"><span/> LIVE PREVIEW</span></div>
              <div className="design-gallery">
                <div className="design-gallery-heading">
                  <div><label className="tool-label">CHOOSE YOUR STRIP DESIGN</label><span>Pick a collection, then switch designs without retaking photos.</span></div>
                  <div className="design-gallery-navigation">
                    <span>{filteredDesigns.length ? designPage * designsPerPage + 1 : 0}–{Math.min((designPage + 1) * designsPerPage, filteredDesigns.length)} of {filteredDesigns.length}</span>
                    <button type="button" aria-label="Previous strip designs" disabled={designPage === 0} onClick={() => setDesignPage(page => Math.max(0, page - 1))}><ChevronLeft size={16}/></button>
                    <button type="button" aria-label="Next strip designs" disabled={designPage >= designPageCount - 1} onClick={() => setDesignPage(page => Math.min(designPageCount - 1, page + 1))}><ChevronRight size={16}/></button>
                  </div>
                </div>
                <div className="design-category-tabs" aria-label="Template collections">
                  <button type="button" className={designCategory === 'all' ? 'active' : ''} onClick={() => { setDesignCategory('all'); setDesignPage(0) }}>All designs</button>
                  <button type="button" className={designCategory === 'cozy' ? 'active' : ''} onClick={() => { setDesignCategory('cozy'); setDesignPage(0) }}>Cozy ✨</button>
                  <button type="button" className={designCategory === 'halloween' ? 'active' : ''} onClick={() => { setDesignCategory('halloween'); setDesignPage(0) }}>Halloween 🎃</button>
                  <button type="button" className={designCategory === 'christmas' ? 'active' : ''} onClick={() => { setDesignCategory('christmas'); setDesignPage(0) }}>Christmas 🎄</button>
                </div>
                <div className="design-gallery-list">
                  {visibleDesigns.map(design => <button
                    key={design.id}
                    type="button"
                    className={`design-card ${selectedDesign === design.id ? 'selected' : ''} ${design.id}`}
                    aria-pressed={selectedDesign === design.id}
                    onClick={() => chooseDesign(design.id)}
                  >
                    <span className={`design-card-preview ${design.id}`} style={{ backgroundColor: design.background }}>
                      <span className="design-mini-strip">
                        {[0, 1, 2].map(index => <i key={index} className="design-mini-shot" style={shots[index % Math.max(shots.length, 1)] ? { backgroundImage: `url("${shots[index % shots.length].url}")` } : undefined}/>)}
                        <b>{design.emoji}</b>
                      </span>
                    </span>
                    <span className="design-card-name">{design.name}</span>
                    <span className="design-card-season">{design.emoji} {design.category === 'halloween' ? 'Halloween' : design.category === 'christmas' ? 'Christmas' : 'Cozy'}</span>
                    <span className="design-card-description">{design.description}</span>
                    <span className="design-card-action">{selectedDesign === design.id ? <><Check size={11}/> Selected</> : 'Use This Design'}</span>
                  </button>)}
                </div>
                <button className="text-btn reset-design-btn" onClick={resetDesign}><RefreshCw size={13}/> Reset to Original Design</button>
              </div>
              <div className="editor-layout">
                <div className="strip-stage">
                  <div className="strip-wrap" ref={previewRef} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}>
                    <canvas ref={canvasRef} className="strip-canvas" aria-label="Photobooth strip preview"/>
                    {decorations.map(d => <button key={d.id} type="button" className={`decoration-handle ${selectedDecorationId === d.id ? 'selected' : ''}`} aria-label={`Select ${d.emoji} sticker`} aria-pressed={selectedDecorationId === d.id} style={{ left: `${d.x}%`, top: `${d.y}%`, fontSize: `${d.size}px`, transform: `translate(-50%,-50%) rotate(${d.rotation}deg)` }} onPointerDown={e => pointerDown(e, d.id)} onClick={() => setSelectedDecorationId(d.id)} title="Drag to move; select to resize, rotate, or delete">{d.emoji}</button>)}
                  </div>
                  <span className="drag-hint">✧ drag stickers to move · tap to remove</span>
                </div>
                <div className="tools">
                  <div className="tabs"><button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}><Settings2 size={14}/> Design</button><button className={activeTab === 'stickers' ? 'active' : ''} onClick={() => setActiveTab('stickers')}><Sparkles size={14}/> Stickers</button></div>
                  {activeTab === 'design' ? <>
                    <label className="tool-label" htmlFor="strip-layout">PHOTO ARRANGEMENT</label>
                    <select id="strip-layout" className="design-select" value={layout} onChange={e => setLayout(e.target.value === 'collage' ? 'collage' : 'vertical')}>
                      <option value="vertical">Classic vertical strip</option><option value="collage">2-column collage</option>
                    </select>
                    <label className="tool-label">FRAME STYLE</label>
                    <div className="choice-row">{(['classic', 'vintage', 'minimal', 'rounded', 'film', 'botanical'] as FrameStyle[]).map(v => <button key={v} className={`choice ${frameStyle === v ? 'selected' : ''}`} onClick={() => setFrameStyle(v)}>{v}</button>)}</div>
                    <label className="tool-label">STRIP SPACING</label>
                    <div className="range-control"><span>Padding</span><input aria-label="Strip padding" type="range" min="18" max="52" value={stripPadding} onChange={e => setStripPadding(Number(e.target.value))}/><b>{stripPadding}</b></div>
                    <div className="range-control"><span>Photo gap</span><input aria-label="Photo spacing" type="range" min="6" max="30" value={photoSpacing} onChange={e => setPhotoSpacing(Number(e.target.value))}/><b>{photoSpacing}</b></div>
                    <label className="tool-label">BACKGROUND</label>
                    <div className="swatches">{['#f7efe5','#f5dfe0','#ead9c8','#e6e8dc','#e6e1ed','#ffffff','#d9c3aa', '#dcecf4', '#292929'].map(c => <button key={c} aria-label={`Background ${c}`} className={`swatch ${bg === c ? 'picked' : ''}`} style={{ background: c }} onClick={() => setBg(c)}/>)}</div>
                    <label className="custom-color-label">Custom color<input aria-label="Custom strip background color" type="color" value={bg} onChange={e => setBg(e.target.value)}/></label>
                    <label className="tool-label">PHOTO FILTER</label>
                    <div className="filter-grid">{photoFilters.slice(filterPage * filtersPerPage, (filterPage + 1) * filtersPerPage).map(({ id, name }) => <button key={id} type="button" aria-pressed={filter === id} className={filter === id ? 'filter selected' : 'filter'} onClick={() => setFilter(id)}>{name}</button>)}</div>
                    <div className="filter-pagination">
                      <button type="button" aria-label="Previous photo filters" disabled={filterPage === 0} onClick={() => setFilterPage(page => Math.max(0, page - 1))}><ChevronLeft size={14}/> Previous</button>
                      <span>{filterPage + 1} / {Math.ceil(photoFilters.length / filtersPerPage)}</span>
                      <button type="button" aria-label="Next photo filters" disabled={(filterPage + 1) * filtersPerPage >= photoFilters.length} onClick={() => setFilterPage(page => Math.min(Math.ceil(photoFilters.length / filtersPerPage) - 1, page + 1))}>Next <ChevronRight size={14}/></button>
                    </div>
                    <label className="tool-label">TITLE & CAPTION</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Strip title" maxLength={24}/>
                    <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a little message or emoji" maxLength={64}/>
                    <label className="custom-color-label">Text color<input aria-label="Caption and title color" type="color" value={captionColor} onChange={e => setCaptionColor(e.target.value)}/></label>
                    <div className="range-control"><span>Text size</span><input aria-label="Caption font size" type="range" min="11" max="26" value={captionFontSize} onChange={e => setCaptionFontSize(Number(e.target.value))}/><b>{captionFontSize}</b></div>
                    <label className="tool-label" htmlFor="caption-font-style">FONT STYLE</label>
                    <select id="caption-font-style" className="design-select" value={captionFontStyle} onChange={e => setCaptionFontStyle(e.target.value === 'italic' || e.target.value === 'bold' ? e.target.value : 'normal')}>
                      <option value="normal">Regular</option><option value="italic">Handwritten italic</option><option value="bold">Bold</option>
                    </select>
                    <label className="tool-label" htmlFor="caption-alignment">TEXT ALIGNMENT</label>
                    <select id="caption-alignment" className="design-select" value={captionAlignment} onChange={e => setCaptionAlignment(e.target.value === 'left' || e.target.value === 'right' ? e.target.value : 'center')}>
                      <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
                    </select>
                    <div className="range-control"><span>Caption position</span><input aria-label="Caption position" type="range" min="-16" max="16" value={captionOffset} onChange={e => setCaptionOffset(Number(e.target.value))}/><b>{captionOffset}</b></div>
                  </> : <>
                    <label className="tool-label">PICK A LITTLE DECORATION</label>
                    <div className="sticker-category-tabs" role="tablist" aria-label="Sticker categories">
                      {(['cozy', 'halloween', 'christmas'] as const).map(category => (
                        <button
                          key={category}
                          className={`sticker-category-tab${stickerCategory === category ? ' active' : ''}`}
                          role="tab"
                          aria-selected={stickerCategory === category}
                          onClick={() => setStickerCategory(category)}
                        >
                          {category === 'cozy' ? 'Cozy' : category === 'halloween' ? 'Halloween 🎃' : 'Christmas 🎄'}
                        </button>
                      ))}
                    </div>
                    <div className="sticker-library-label">{availableStickers.length} {stickerCategory} stickers · choose one to add</div>
                    <div className="emoji-grid">{availableStickers.map(emoji => <button key={emoji} aria-label={`Add ${emoji} sticker`} onClick={() => addDecoration(emoji)}>{emoji}</button>)}</div>
                    <label className="tool-label">STICKER SIZE</label>
                    <div className="choice-row"><button className="choice" disabled={selectedDecorationId === null} onClick={() => setDecorations(p => p.map(d => d.id === selectedDecorationId ? {...d,size:Math.max(16,d.size-5)} : d))}>Smaller −</button><button className="choice" disabled={selectedDecorationId === null} onClick={() => setDecorations(p => p.map(d => d.id === selectedDecorationId ? {...d,size:Math.min(54,d.size+5)} : d))}>Larger +</button><button className="choice" disabled={selectedDecorationId === null} onClick={() => setDecorations(p => p.map(d => d.id === selectedDecorationId ? {...d,rotation:(d.rotation+15)%360} : d))}>Rotate ↻</button></div>
                    <button className="text-btn" disabled={selectedDecorationId === null} onClick={() => { setDecorations(p => p.filter(d => d.id !== selectedDecorationId)); setSelectedDecorationId(null) }}><Trash2 size={14}/> Delete selected sticker</button>
                    <button className="text-btn" disabled={!decorations.length} onClick={() => { setDecorations([]); setSelectedDecorationId(null) }}><Trash2 size={14}/> Remove all stickers</button>
                  </>}
                  <div className="tool-tip"><Sparkles size={14}/> Your decorations and captions are included in the downloaded image.</div>
                </div>
              </div>
              <div className="editor-footer">
                <span>{shots.length === count ? <><Check size={14}/> Your strip is ready to download</> : <><ImagePlus size={14}/> {count - shots.length} more photo{count - shots.length === 1 ? '' : 's'} to complete your strip</>}</span>
                <div className="export-actions">
                  <label className="sr-only" htmlFor="export-format">Download format</label>
                  <select id="export-format" value={exportFormat} onChange={e => setExportFormat(e.target.value === 'jpeg' ? 'jpeg' : 'png')}>
                    <option value="png">PNG</option><option value="jpeg">JPEG</option>
                  </select>
                  <button className="download-btn" onClick={download}><Download size={16}/> Download {exportFormat.toUpperCase()}</button>
                </div>
              </div>
              {(videoRecording || videoUrl) && <div className="video-export">
                <span>{videoRecording
                  ? <><i/> Video recording in progress</>
                  : <><Film size={14}/> Video ready · {videoExtension.toUpperCase()}</>}</span>
                {videoUrl && (appleMobile
                  ? <button className="video-download" type="button" onClick={downloadVideo}><Download size={14}/>Save / Share video</button>
                  : <a className="video-download" href={videoUrl} download={`cozy-booth-photo-session.${videoExtension}`} type={videoBlobRef.current?.type}><Download size={14}/>Download {videoExtension.toUpperCase()}</a>)}
                {videoUrl && appleMobile && <a className="video-open" href={videoUrl} target="_blank" rel="noopener">Open video</a>}
              </div>}
              {videoUrl && appleMobile && <p className="ios-video-hint">Use “Save / Share video” and choose “Save Video” for Photos. If sharing is unavailable, tap “Open video”, then use the player’s Share button to save it to Photos or Files.</p>}
              {notice && <div className="success-note">{notice}</div>}
            </section>
          </div>
        </section>

        <section className="how-section">
          <span className="eyebrow">A LITTLE HOW-TO</span><h2>Three steps, <em>one sweet memory.</em></h2>
          <div className="how-grid"><div><span>01</span><h3>Get camera-ready</h3><p>Allow camera access and choose how many moments to capture.</p></div><div><span>02</span><h3>Make it yours</h3><p>Pick a soft filter, a pretty background, and add your favorite stickers.</p></div><div><span>03</span><h3>Keep the memory</h3><p>Download your finished strip and share it with someone special.</p></div></div>
        </section>
      </main>
      <footer><a className="brand" href="#"><span className="brand-mark">♡</span><span>cozy booth</span></a><span>made with a little love ✿</span><span>Created by Nielp</span><span>© {new Date().getFullYear()} Cozy Booth</span></footer>
    </div>
  )
}