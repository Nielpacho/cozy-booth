export type FrameStyle = 'classic' | 'vintage' | 'minimal' | 'rounded' | 'film' | 'botanical'
export type StripLayout = 'vertical' | 'collage'

export type StripDesign = {
  id: string
  name: string
  emoji: string
  description: string
  background: string
  accent: string
  frameColor: string
  frameStyle: FrameStyle
  borderRadius: number
  borderThickness: number
  padding: number
  spacing: number
  fontFamily: string
  fontStyle: string
  caption: string
  decorations: string[]
  texture: 'none' | 'grain' | 'paper' | 'sparkle'
  filter: 'natural' | 'warm' | 'pastel' | 'mono' | 'retro' | 'glow'
  layouts: StripLayout[]
}

const allLayouts: StripLayout[] = ['vertical', 'collage']

export const stripDesigns: StripDesign[] = [
  {
    id: 'coquette-pink', name: 'Coquette Pink', emoji: '🎀', description: 'Blush pink, bows, and tiny hearts.',
    background: '#f9e4e8', accent: '#b85f79', frameColor: '#e8a8b8', frameStyle: 'rounded',
    borderRadius: 15, borderThickness: 3, padding: 34, spacing: 15, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'made with love ♡', decorations: ['🎀', '♡', '♥'], texture: 'none', filter: 'pastel', layouts: allLayouts,
  },
  {
    id: 'vanilla-cream', name: 'Vanilla Cream', emoji: '☁️', description: 'Warm ivory with elegant details.',
    background: '#f6f0e5', accent: '#806b56', frameColor: '#fffdf8', frameStyle: 'minimal',
    borderRadius: 3, borderThickness: 4, padding: 36, spacing: 14, fontFamily: '"Playfair Display", serif',
    fontStyle: 'normal', caption: 'little moments', decorations: ['✧', '·', '✦'], texture: 'paper', filter: 'warm', layouts: allLayouts,
  },
  {
    id: 'vintage-film', name: 'Vintage Film', emoji: '🎞️', description: 'Sepia tones and classic film borders.',
    background: '#dfcfb7', accent: '#76563c', frameColor: '#fff7e8', frameStyle: 'film',
    borderRadius: 2, borderThickness: 10, padding: 38, spacing: 19, fontFamily: '"Playfair Display", serif',
    fontStyle: 'normal', caption: 'memories on film', decorations: ['✧', '▪', '✦'], texture: 'grain', filter: 'retro', layouts: allLayouts,
  },
  {
    id: 'y2k-pop', name: 'Y2K Pop', emoji: '💿', description: 'Pastel pop, chrome stars, and smileys.',
    background: '#e8e4fa', accent: '#7556a5', frameColor: '#b9a2ef', frameStyle: 'classic',
    borderRadius: 13, borderThickness: 4, padding: 32, spacing: 13, fontFamily: '"DM Sans", sans-serif',
    fontStyle: 'normal', caption: 'too cute to forget!', decorations: ['✦', '☺', '💿'], texture: 'sparkle', filter: 'glow', layouts: allLayouts,
  },
  {
    id: 'sweet-strawberry', name: 'Sweet Strawberry', emoji: '🍓', description: 'Strawberry red with playful rounded frames.',
    background: '#f8e5df', accent: '#b8444e', frameColor: '#e99791', frameStyle: 'rounded',
    borderRadius: 19, borderThickness: 4, padding: 34, spacing: 16, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'sweet like strawberry', decorations: ['🍓', '✿', '♥'], texture: 'none', filter: 'warm', layouts: allLayouts,
  },
  {
    id: 'blue-dream', name: 'Blue Dream', emoji: '🦋', description: 'Powder blue, clouds, and butterflies.',
    background: '#e4f1f8', accent: '#527e9b', frameColor: '#a9d2e7', frameStyle: 'classic',
    borderRadius: 14, borderThickness: 4, padding: 34, spacing: 15, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'dreamy days', decorations: ['🦋', '☁', '✦'], texture: 'sparkle', filter: 'pastel', layouts: allLayouts,
  },
  {
    id: 'lavender-haze', name: 'Lavender Haze', emoji: '💜', description: 'Lilac flowers and soft dreamy borders.',
    background: '#eee8f5', accent: '#785e96', frameColor: '#c4addd', frameStyle: 'botanical',
    borderRadius: 14, borderThickness: 3, padding: 35, spacing: 16, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'in my little world', decorations: ['✿', '☾', '✦'], texture: 'none', filter: 'glow', layouts: allLayouts,
  },
  {
    id: 'mono', name: 'Minimal Black & White', emoji: '🖤', description: 'Crisp monochrome with modern lines.',
    background: '#fffefe', accent: '#252525', frameColor: '#262626', frameStyle: 'minimal',
    borderRadius: 0, borderThickness: 2, padding: 30, spacing: 10, fontFamily: '"DM Sans", sans-serif',
    fontStyle: 'normal', caption: '', decorations: [], texture: 'none', filter: 'mono', layouts: allLayouts,
  },
  {
    id: 'film-diary', name: 'Film Diary', emoji: '📷', description: 'Paper grain and scrapbook film notes.',
    background: '#eee9dd', accent: '#655d51', frameColor: '#f9f6ec', frameStyle: 'film',
    borderRadius: 2, borderThickness: 7, padding: 37, spacing: 17, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'photo diary', decorations: ['▪', '✧', '⌁'], texture: 'paper', filter: 'warm', layouts: allLayouts,
  },
  {
    id: 'picnic-garden', name: 'Picnic Garden', emoji: '🌷', description: 'Sage leaves and a soft floral touch.',
    background: '#e9eddf', accent: '#667e5b', frameColor: '#f7f3e8', frameStyle: 'botanical',
    borderRadius: 12, borderThickness: 3, padding: 36, spacing: 16, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'a lovely day', decorations: ['🌷', '❀', '🦋'], texture: 'paper', filter: 'pastel', layouts: allLayouts,
  },
  {
    id: 'chocolate-cafe', name: 'Chocolate Café', emoji: '☕', description: 'Mocha, latte, and cozy café lettering.',
    background: '#e8d8c8', accent: '#684735', frameColor: '#fff5e9', frameStyle: 'classic',
    borderRadius: 10, borderThickness: 5, padding: 36, spacing: 17, fontFamily: '"Playfair Display", serif',
    fontStyle: 'normal', caption: 'coffee and memories', decorations: ['☕', '♡', '✦'], texture: 'paper', filter: 'warm', layouts: allLayouts,
  },
  {
    id: 'kawaii-pastel', name: 'Kawaii Pastel', emoji: '🧸', description: 'Pastel rainbow with cute happy details.',
    background: '#f6e8ed', accent: '#a75f8b', frameColor: '#c6e8d9', frameStyle: 'rounded',
    borderRadius: 18, borderThickness: 4, padding: 34, spacing: 15, fontFamily: '"DM Sans", sans-serif',
    fontStyle: 'normal', caption: 'happy little memories', decorations: ['🧸', '☺', '☁'], texture: 'sparkle', filter: 'glow', layouts: allLayouts,
  },
]

export const getStripDesign = (id: string) => stripDesigns.find(design => design.id === id) ?? stripDesigns[0]
