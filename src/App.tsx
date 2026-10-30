import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Camera, CameraOff, Download, Film, Heart, ImagePlus, RefreshCw, Settings2, Sparkles, Trash2, Undo2, SwitchCamera, Check } from 'lucide-react'

type Shot = { id: number; url: string }
type Decor = { id: number; emoji: string; x: number; y: number; size: number; rotation: number }
type Filter = 'natural' | 'warm' | 'pastel' | 'mono' | 'retro' | 'glow'
type ExportFormat = 'png' | 'jpeg'
type FrameStyle = 'classic' | 'vintage' | 'minimal'

const stripDesigns = [
  { id: 'cozy-classic', name: 'Cozy Classic', mood: 'CLASSIC', background: '#f7efe5', accent: '#bd8179', frameStyle: 'classic' as FrameStyle, motif: '♡' },
  { id: 'blush-bloom', name: 'Blush Bloom', mood: 'SOFT', background: '#f8e6e7', accent: '#c76f83', frameStyle: 'classic' as FrameStyle, motif: '✿' },
  { id: 'sage-garden', name: 'Sage Garden', mood: 'BOTANICAL', background: '#e8ecdf', accent: '#788b70', frameStyle: 'vintage' as FrameStyle, motif: '❀' },
  { id: 'lavender-dream', name: 'Lavender Dream', mood: 'DREAMY', background: '#ebe6f1', accent: '#9180a8', frameStyle: 'classic' as FrameStyle, motif: '✦' },
  { id: 'vintage-film', name: 'Vintage Film', mood: 'RETRO', background: '#e8d8c3', accent: '#896846', frameStyle: 'vintage' as FrameStyle, motif: '✧' },
  { id: 'clean-minimal', name: 'Clean Minimal', mood: 'MINIMAL', background: '#ffffff', accent: '#6f6862', frameStyle: 'minimal' as FrameStyle, motif: '·' },
]
const filterCss: Record<Filter, string> = {
  natural: 'none',
  warm: 'sepia(.22) saturate(1.2) contrast(1.02)',
  pastel: 'brightness(1.08) saturate(.78) contrast(.92)',
  mono: 'grayscale(1) contrast(1.08)',
  retro: 'sepia(.35) saturate(.8) contrast(1.12)',
  glow: 'brightness(1.12) saturate(.88)',
}
const emojis = ['💗', '✨', '🎀', '🌷', '☁️', '⭐', '🧸', '♡', '🌼', '🦋', '🤎', '☺️']

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recordingCompletedRef = useRef(false)
  const videoSessionCompleteRef = useRef(false)
  const videoUrlRef = useRef<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [facing, setFacing] = useState<'user' | 'environment'>('user')
  const [cameraError, setCameraError] = useState('')
  const [shots, setShots] = useState<Shot[]>([])
  const [count, setCount] = useState(4)
  const [seconds, setSeconds] = useState(3)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState<Filter>('natural')
  const [bg, setBg] = useState('#f7efe5')
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('classic')
  const [selectedDesign, setSelectedDesign] = useState('cozy-classic')
  const [caption, setCaption] = useState('little moments, lovely memories')
  const [title, setTitle] = useState('COZY BOOTH')
  const [decorations, setDecorations] = useState<Decor[]>([])
  const [selectedEmoji, setSelectedEmoji] = useState('💗')
  const [dragging, setDragging] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'design' | 'stickers'>('design')
  const [notice, setNotice] = useState('')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoExtension, setVideoExtension] = useState('webm')
  const [videoRecording, setVideoRecording] = useState(false)

  const clearVideo = useCallback(() => {
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current)
    videoUrlRef.current = null
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

    const mimeType = typeof MediaRecorder.isTypeSupported === 'function'
      ? ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
        .find(type => MediaRecorder.isTypeSupported(type))
      : undefined

    try {
      clearVideo()
      recordedChunksRef.current = []
      recordingCompletedRef.current = false
      videoSessionCompleteRef.current = false
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorder.ondataavailable = event => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const completed = recordingCompletedRef.current
        recordingCompletedRef.current = false
        videoSessionCompleteRef.current = completed
        recorderRef.current = null
        setVideoRecording(false)
        if (completed && recordedChunksRef.current.length) {
          const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'video/webm' })
          if (blob.size > 0) {
            const url = URL.createObjectURL(blob)
            videoUrlRef.current = url
            setVideoUrl(url)
            setVideoExtension(blob.type.includes('mp4') ? 'mp4' : 'webm')
          }
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
  }, [clearVideo])

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

  useEffect(() => () => {
    recordingCompletedRef.current = false
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop()
    streamRef.current?.getTracks().forEach(track => track.stop())
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
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const url = canvas.toDataURL('image/jpeg', .94)
    setShots(prev => [...prev, { id: Date.now() + Math.random(), url }])
    return true
  }, [facing])

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
  const addDecoration = (emoji: string) => setDecorations(prev => [...prev, {
    id: Date.now() + Math.random(), emoji, x: 50, y: 50, size: 30, rotation: Math.round(Math.random() * 24 - 12),
  }])

  const stripDimensions = useMemo(() => ({ width: 600, height: Math.round(600 * (count * .75 + .9)) }), [count])
  const currentDesign = stripDesigns.find(design => design.id === selectedDesign) ?? stripDesigns[0]

  const chooseDesign = (designId: string) => {
    const design = stripDesigns.find(item => item.id === designId)
    if (!design) return
    setSelectedDesign(design.id)
    setBg(design.background)
    setFrameStyle(design.frameStyle)
  }

  const drawStrip = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = stripDimensions.width
    const H = stripDimensions.height
    canvas.width = W
    canvas.height = H
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)
    const pad = frameStyle === 'minimal' ? 24 : frameStyle === 'vintage' ? 38 : 34
    const gap = frameStyle === 'minimal' ? 10 : frameStyle === 'vintage' ? 18 : 14
    const footer = 104
    const photoW = W - pad * 2
    const photoH = (H - pad * 2 - footer - gap * (count - 1)) / count

    for (let i = 0; i < count; i++) {
      const shot = shots[i]
      const x = pad
      const y = pad + i * (photoH + gap)
      const border = frameStyle === 'minimal' ? 0 : frameStyle === 'vintage' ? 9 : 5
      ctx.fillStyle = frameStyle === 'vintage' ? '#fffaf0' : '#ffffff'
      ctx.fillRect(x - border, y - border, photoW + border * 2, photoH + border * 2)
      if (shot) {
        const img = new Image()
        img.src = shot.url
        await new Promise<void>(resolve => { img.onload = () => resolve(); img.onerror = () => resolve() })
        ctx.save()
        ctx.beginPath()
        ctx.rect(x, y, photoW, photoH)
        ctx.clip()
        ctx.filter = filterCss[filter]
        const scale = Math.max(photoW / img.width, photoH / img.height)
        const sw = photoW / scale, sh = photoH / scale
        ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, photoW, photoH)
        ctx.restore()
      } else {
        ctx.fillStyle = '#eadfd2'
        ctx.fillRect(x, y, photoW, photoH)
        ctx.fillStyle = '#9a8270'
        ctx.textAlign = 'center'
        ctx.font = '22px sans-serif'
        ctx.fillText('your photo goes here', W / 2, y + photoH / 2)
      }
    }
    ctx.fillStyle = currentDesign.accent
    ctx.textAlign = 'center'
    ctx.font = frameStyle === 'vintage' ? '600 19px "Playfair Display", serif' : '600 19px "DM Sans", sans-serif'
    ctx.fillText(title.toUpperCase(), W / 2, H - 73)
    ctx.font = 'italic 17px "Playfair Display", serif'
    ctx.fillText(caption.slice(0, 48), W / 2, H - 43)
    ctx.font = '13px "DM Sans", sans-serif'
    ctx.fillText(new Date().toLocaleDateString(), W / 2, H - 17)

    if (frameStyle !== 'minimal') {
      ctx.save()
      ctx.fillStyle = currentDesign.accent
      ctx.font = '22px serif'
      ctx.textAlign = 'center'
      for (let i = 0; i < count; i++) {
        const y = pad + i * (photoH + gap) + photoH - 12
        ctx.fillText(currentDesign.motif, W - pad - 13, y)
      }
      ctx.restore()
    }

    decorations.forEach(d => {
      ctx.save()
      ctx.translate(W * d.x / 100, H * d.y / 100)
      ctx.rotate(d.rotation * Math.PI / 180)
      ctx.font = `${d.size * 1.7}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(d.emoji, 0, 0)
      ctx.restore()
    })
    return canvas
  }, [bg, caption, count, currentDesign, decorations, filter, frameStyle, shots, stripDimensions, title])

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

  const reset = () => {
    stopVideoRecording(false)
    videoSessionCompleteRef.current = false
    clearVideo()
    setShots([])
    setDecorations([])
    setNotice('')
    setCountdown(null)
  }

  const pointerDown = (e: React.PointerEvent, id: number) => {
    setDragging(id)
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
                  className={`camera-video ${facing === 'user' ? 'mirrored' : ''}`}
                  style={{ display: cameraOn ? 'block' : 'none' }}
                />
                {!cameraOn && <div className="camera-placeholder"><div className="camera-icon"><CameraOff size={30}/></div><strong>Your camera goes here</strong><span>Allow camera access when you're ready ♡</span></div>}
                {countdown !== null && <div className="countdown-overlay"><span>{countdown === 0 ? '✦' : countdown}</span><small>get ready!</small></div>}
                <span className="camera-corner">LIVE PREVIEW</span>
              </div>
              {cameraError && <div className="error-box">{cameraError}</div>}
              <div className="camera-settings">
                <label>PHOTOS PER STRIP<select value={count} disabled={busy || videoRecording} onChange={e => { setCount(Number(e.target.value)); setShots([]) }}><option value={2}>2 photos</option><option value={3}>3 photos</option><option value={4}>4 photos</option><option value={6}>6 photos</option></select></label>
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
                  <div><label className="tool-label">PICK YOUR STRIP DESIGN</label><span>Choose a look to preview it on your strip.</span></div>
                  <span>{stripDesigns.length} designs</span>
                </div>
                <div className="design-gallery-list">
                  {stripDesigns.map(design => <button
                    key={design.id}
                    type="button"
                    className={`design-card ${selectedDesign === design.id ? 'selected' : ''}`}
                    aria-pressed={selectedDesign === design.id}
                    onClick={() => chooseDesign(design.id)}
                  >
                    <span className={`design-card-preview ${design.id}`} style={{ backgroundColor: design.background }}>
                      <span className="design-mini-strip">
                        <i/><i/><i/>
                        <b>{design.motif}</b>
                      </span>
                    </span>
                    <span className="design-card-name">{design.name}</span>
                    <span className="design-card-mood">{design.mood}</span>
                    {selectedDesign === design.id && <span className="design-card-check"><Check size={11}/></span>}
                  </button>)}
                </div>
              </div>
              <div className="editor-layout">
                <div className="strip-stage">
                  <div className="strip-wrap" ref={previewRef} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}>
                    <canvas ref={canvasRef} className="strip-canvas" aria-label="Photobooth strip preview"/>
                    {decorations.map(d => <button key={d.id} className="decoration-handle" style={{ left: `${d.x}%`, top: `${d.y}%`, fontSize: `${d.size}px`, transform: `translate(-50%,-50%) rotate(${d.rotation}deg)` }} onPointerDown={e => pointerDown(e, d.id)} onClick={() => setDecorations(prev => prev.filter(x => x.id !== d.id))} title="Drag to move; click to remove">{d.emoji}</button>)}
                  </div>
                  <span className="drag-hint">✧ drag stickers to move · tap to remove</span>
                </div>
                <div className="tools">
                  <div className="tabs"><button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}><Settings2 size={14}/> Design</button><button className={activeTab === 'stickers' ? 'active' : ''} onClick={() => setActiveTab('stickers')}><Sparkles size={14}/> Stickers</button></div>
                  {activeTab === 'design' ? <>
                    <label className="tool-label">FRAME STYLE</label>
                    <div className="choice-row">{(['classic', 'vintage', 'minimal'] as FrameStyle[]).map(v => <button key={v} className={`choice ${frameStyle === v ? 'selected' : ''}`} onClick={() => setFrameStyle(v)}>{v}</button>)}</div>
                    <label className="tool-label">BACKGROUND</label>
                    <div className="swatches">{['#f7efe5','#f5dfe0','#ead9c8','#e6e8dc','#e6e1ed','#ffffff','#d9c3aa'].map(c => <button key={c} aria-label={`Background ${c}`} className={`swatch ${bg === c ? 'picked' : ''}`} style={{ background: c }} onClick={() => setBg(c)}/>)}</div>
                    <label className="tool-label">PHOTO FILTER</label>
                    <div className="filter-grid">{(['natural','warm','pastel','mono','retro','glow'] as Filter[]).map(f => <button key={f} className={filter === f ? 'filter selected' : 'filter'} onClick={() => setFilter(f)}>{f === 'mono' ? 'B&W' : f}</button>)}</div>
                    <label className="tool-label">TITLE & CAPTION</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Strip title" maxLength={24}/>
                    <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a little message" maxLength={48}/>
                  </> : <>
                    <label className="tool-label">PICK A LITTLE DECORATION</label>
                    <div className="emoji-grid">{emojis.map(emoji => <button key={emoji} onClick={() => addDecoration(emoji)}>{emoji}</button>)}</div>
                    <label className="tool-label">STICKER SIZE</label>
                    <div className="choice-row"><button className="choice" onClick={() => setDecorations(p => p.map(d => ({...d,size:Math.max(16,d.size-5)})))}>Smaller −</button><button className="choice" onClick={() => setDecorations(p => p.map(d => ({...d,size:Math.min(54,d.size+5)})))}>Larger +</button></div>
                    <button className="text-btn" onClick={() => setDecorations([])}><Trash2 size={14}/> Remove all stickers</button>
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
                <span>{videoRecording ? <><i/> Video recording in progress</> : <><Film size={14}/> Your photo session video is ready</>}</span>
                {videoUrl && <a className="video-download" href={videoUrl} download={`cozy-booth-photo-session.${videoExtension}`}><Download size={14}/> Download video</a>}
              </div>}
              {notice && <div className="success-note">{notice}</div>}
            </section>
          </div>
        </section>

        <section className="how-section">
          <span className="eyebrow">A LITTLE HOW-TO</span><h2>Three steps, <em>one sweet memory.</em></h2>
          <div className="how-grid"><div><span>01</span><h3>Get camera-ready</h3><p>Allow camera access and choose how many moments to capture.</p></div><div><span>02</span><h3>Make it yours</h3><p>Pick a soft filter, a pretty background, and add your favorite stickers.</p></div><div><span>03</span><h3>Keep the memory</h3><p>Download your finished strip and share it with someone special.</p></div></div>
        </section>
      </main>
      <footer><a className="brand" href="#"><span className="brand-mark">♡</span><span>cozy booth</span></a><span>made with a little love ✿</span><span>© {new Date().getFullYear()} Cozy Booth</span></footer>
    </div>
  )
}