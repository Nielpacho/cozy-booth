export type FrameStyle = 'classic' | 'vintage' | 'minimal' | 'rounded' | 'film' | 'botanical'
export type StripLayout = 'vertical' | 'collage'
export type DesignCategory = 'cozy' | 'halloween' | 'christmas'

export type StripDesign = {
  id: string
  category: DesignCategory
  name: string
  emoji: string
  description: string
  background: string
  accent: string
  frameColor: string
  borderColors?: string[]
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
    id: 'coquette-pink', category: 'cozy', name: 'Coquette Pink', emoji: '🎀', description: 'Blush pink, bows, and tiny hearts.',
    background: '#f9e4e8', accent: '#b85f79', frameColor: '#e8a8b8', frameStyle: 'rounded',
    borderRadius: 15, borderThickness: 3, padding: 34, spacing: 15, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'made with love ♡', decorations: ['🎀', '♡', '♥'], texture: 'none', filter: 'pastel', layouts: allLayouts,
  },
  {
    id: 'vanilla-cream', category: 'cozy', name: 'Vanilla Cream', emoji: '☁️', description: 'Warm ivory with elegant details.',
    background: '#f6f0e5', accent: '#806b56', frameColor: '#fffdf8', frameStyle: 'minimal',
    borderRadius: 3, borderThickness: 4, padding: 36, spacing: 14, fontFamily: '"Playfair Display", serif',
    fontStyle: 'normal', caption: 'little moments', decorations: ['✧', '·', '✦'], texture: 'paper', filter: 'warm', layouts: allLayouts,
  },
  {
    id: 'vintage-film', category: 'cozy', name: 'Vintage Film', emoji: '🎞️', description: 'Sepia tones and classic film borders.',
    background: '#dfcfb7', accent: '#76563c', frameColor: '#fff7e8', frameStyle: 'film',
    borderRadius: 2, borderThickness: 10, padding: 38, spacing: 19, fontFamily: '"Playfair Display", serif',
    fontStyle: 'normal', caption: 'memories on film', decorations: ['✧', '▪', '✦'], texture: 'grain', filter: 'retro', layouts: allLayouts,
  },
  {
    id: 'y2k-pop', category: 'cozy', name: 'Y2K Pop', emoji: '💿', description: 'Pastel pop, chrome stars, and smileys.',
    background: '#e8e4fa', accent: '#7556a5', frameColor: '#b9a2ef', frameStyle: 'classic',
    borderRadius: 13, borderThickness: 4, padding: 32, spacing: 13, fontFamily: '"DM Sans", sans-serif',
    fontStyle: 'normal', caption: 'too cute to forget!', decorations: ['✦', '☺', '💿'], texture: 'sparkle', filter: 'glow', layouts: allLayouts,
  },
  {
    id: 'sweet-strawberry', category: 'cozy', name: 'Sweet Strawberry', emoji: '🍓', description: 'Strawberry red with playful rounded frames.',
    background: '#f8e5df', accent: '#b8444e', frameColor: '#e99791', frameStyle: 'rounded',
    borderRadius: 19, borderThickness: 4, padding: 34, spacing: 16, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'sweet like strawberry', decorations: ['🍓', '✿', '♥'], texture: 'none', filter: 'warm', layouts: allLayouts,
  },
  {
    id: 'blue-dream', category: 'cozy', name: 'Blue Dream', emoji: '🦋', description: 'Powder blue, clouds, and butterflies.',
    background: '#e4f1f8', accent: '#527e9b', frameColor: '#a9d2e7', frameStyle: 'classic',
    borderRadius: 14, borderThickness: 4, padding: 34, spacing: 15, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'dreamy days', decorations: ['🦋', '☁', '✦'], texture: 'sparkle', filter: 'pastel', layouts: allLayouts,
  },
  {
    id: 'lavender-haze', category: 'cozy', name: 'Lavender Haze', emoji: '💜', description: 'Lilac flowers and soft dreamy borders.',
    background: '#eee8f5', accent: '#785e96', frameColor: '#c4addd', frameStyle: 'botanical',
    borderRadius: 14, borderThickness: 3, padding: 35, spacing: 16, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'in my little world', decorations: ['✿', '☾', '✦'], texture: 'none', filter: 'glow', layouts: allLayouts,
  },
  {
    id: 'mono', category: 'cozy', name: 'Minimal Black & White', emoji: '🖤', description: 'Crisp monochrome with modern lines.',
    background: '#fffefe', accent: '#252525', frameColor: '#262626', frameStyle: 'minimal',
    borderRadius: 0, borderThickness: 2, padding: 30, spacing: 10, fontFamily: '"DM Sans", sans-serif',
    fontStyle: 'normal', caption: '', decorations: [], texture: 'none', filter: 'mono', layouts: allLayouts,
  },
  {
    id: 'film-diary', category: 'cozy', name: 'Film Diary', emoji: '📷', description: 'Paper grain and scrapbook film notes.',
    background: '#eee9dd', accent: '#655d51', frameColor: '#f9f6ec', frameStyle: 'film',
    borderRadius: 2, borderThickness: 7, padding: 37, spacing: 17, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'photo diary', decorations: ['▪', '✧', '⌁'], texture: 'paper', filter: 'warm', layouts: allLayouts,
  },
  {
    id: 'picnic-garden', category: 'cozy', name: 'Picnic Garden', emoji: '🌷', description: 'Sage leaves and a soft floral touch.',
    background: '#e9eddf', accent: '#667e5b', frameColor: '#f7f3e8', frameStyle: 'botanical',
    borderRadius: 12, borderThickness: 3, padding: 36, spacing: 16, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'a lovely day', decorations: ['🌷', '❀', '🦋'], texture: 'paper', filter: 'pastel', layouts: allLayouts,
  },
  {
    id: 'chocolate-cafe', category: 'cozy', name: 'Chocolate Café', emoji: '☕', description: 'Mocha, latte, and cozy café lettering.',
    background: '#e8d8c8', accent: '#684735', frameColor: '#fff5e9', frameStyle: 'classic',
    borderRadius: 10, borderThickness: 5, padding: 36, spacing: 17, fontFamily: '"Playfair Display", serif',
    fontStyle: 'normal', caption: 'coffee and memories', decorations: ['☕', '♡', '✦'], texture: 'paper', filter: 'warm', layouts: allLayouts,
  },
  {
    id: 'kawaii-pastel', category: 'cozy', name: 'Kawaii Pastel', emoji: '🧸', description: 'Pastel rainbow with cute happy details.',
    background: '#f6e8ed', accent: '#a75f8b', frameColor: '#c6e8d9', frameStyle: 'rounded',
    borderRadius: 18, borderThickness: 4, padding: 34, spacing: 15, fontFamily: '"DM Sans", sans-serif',
    fontStyle: 'normal', caption: 'happy little memories', decorations: ['🧸', '☺', '☁'], texture: 'sparkle', filter: 'glow', layouts: allLayouts,
  },
  {
    id: 'spooky-cute', category: 'halloween', name: 'Spooky Cute', emoji: '👻', description: 'Pastel pumpkin patches and playful little ghosts.',
    background: '#f3e8ec', accent: '#54364f', frameColor: '#f3a05b', borderColors: ['#f3a05b', '#302b35'], frameStyle: 'rounded',
    borderRadius: 13, borderThickness: 5, padding: 38, spacing: 16, fontFamily: '"DM Sans", sans-serif',
    fontStyle: 'italic', caption: 'too cute to spook! 👻', decorations: ['👻', '🎃', '🦇', '⭐'], texture: 'sparkle', filter: 'pastel', layouts: allLayouts,
  },
  {
    id: 'pink-halloween', category: 'halloween', name: 'Pink Halloween', emoji: '🎀', description: 'Coquette blush, pink ghosts, and sweet bats.',
    background: '#f8e6ee', accent: '#a54e78', frameColor: '#e9a7c3', frameStyle: 'rounded',
    borderRadius: 17, borderThickness: 4, padding: 38, spacing: 16, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'cutest little boo 🎀', decorations: ['🎀', '👻', '🦇', '♡'], texture: 'sparkle', filter: 'pastel', layouts: allLayouts,
  },
  {
    id: 'vintage-haunted', category: 'halloween', name: 'Vintage Haunted', emoji: '🌙', description: 'Antique sepia, film edges, and haunted stars.',
    background: '#3e332f', accent: '#e0bd88', frameColor: '#dfc9a7', frameStyle: 'film',
    borderRadius: 1, borderThickness: 11, padding: 40, spacing: 19, fontFamily: '"Playfair Display", serif',
    fontStyle: 'normal', caption: 'haunted memories • 2026', decorations: ['✦', '☾', '🦇', '✧'], texture: 'grain', filter: 'retro', layouts: allLayouts,
  },
  {
    id: 'pumpkin-patch', category: 'halloween', name: 'Pumpkin Patch', emoji: '🎃', description: 'Burnt orange, sage, and cottagecore leaves.',
    background: '#e8d6bd', accent: '#91512e', frameColor: '#fff2d8', frameStyle: 'rounded',
    borderRadius: 18, borderThickness: 5, padding: 38, spacing: 17, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'pumpkin kisses & autumn wishes 🍂', decorations: ['🎃', '🍂', '🍄', '🌼'], texture: 'paper', filter: 'warm', layouts: allLayouts,
  },
  {
    id: 'midnight-witch', category: 'halloween', name: 'Midnight Witch', emoji: '🪄', description: 'Dreamy violet, moonlight, and potion sparkles.',
    background: '#30283e', accent: '#d3c5ed', frameColor: '#8a72ae', frameStyle: 'botanical',
    borderRadius: 13, borderThickness: 3, padding: 39, spacing: 17, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'a little bit of magic ✨', decorations: ['🌙', '⭐', '🧙', '🧪'], texture: 'sparkle', filter: 'glow', layouts: allLayouts,
  },
  {
    id: 'gothic-night', category: 'halloween', name: 'Gothic Night', emoji: '🦇', description: 'Burgundy roses and dramatic midnight frames.',
    background: '#231e26', accent: '#e4d7d1', frameColor: '#6f293a', frameStyle: 'film',
    borderRadius: 2, borderThickness: 8, padding: 39, spacing: 18, fontFamily: '"Playfair Display", serif',
    fontStyle: 'normal', caption: 'meet me after midnight 🦇', decorations: ['🥀', '🌙', '🦇', '✦'], texture: 'grain', filter: 'mono', layouts: allLayouts,
  },
  {
    id: 'cozy-christmas', category: 'christmas', name: 'Cozy Christmas', emoji: '🎄', description: 'Pine green, warm cream, and nostalgic cheer.',
    background: '#e9e5d7', accent: '#365641', frameColor: '#fff5df', frameStyle: 'classic',
    borderRadius: 9, borderThickness: 5, padding: 38, spacing: 16, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'cozy little Christmas 🎄', decorations: ['🎄', '⭐', '🎀', '🔴'], texture: 'paper', filter: 'warm', layouts: allLayouts,
  },
  {
    id: 'pink-christmas', category: 'christmas', name: 'Pink Christmas', emoji: '🎀', description: 'Blush bows, pink trees, and champagne sparkle.',
    background: '#f8e6eb', accent: '#a95773', frameColor: '#e9b6c8', frameStyle: 'rounded',
    borderRadius: 16, borderThickness: 4, padding: 38, spacing: 16, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'all I want is a pink Christmas 🎀', decorations: ['🎀', '🎄', '♡', '✨'], texture: 'sparkle', filter: 'pastel', layouts: allLayouts,
  },
  {
    id: 'gingerbread-house', category: 'christmas', name: 'Gingerbread House', emoji: '🍪', description: 'Icing-sweet cookie frames and candy colors.',
    background: '#e5c7a6', accent: '#7b482f', frameColor: '#fff1d6', frameStyle: 'rounded',
    borderRadius: 16, borderThickness: 7, padding: 38, spacing: 17, fontFamily: '"Playfair Display", serif',
    fontStyle: 'normal', caption: 'sweetest holiday memories 🍪', decorations: ['🍪', '🍬', '⭐', '❤️'], texture: 'paper', filter: 'warm', layouts: allLayouts,
  },
  {
    id: 'vintage-christmas', category: 'christmas', name: 'Vintage Christmas', emoji: '🎞️', description: 'Faded evergreen, antique cream, and film grain.',
    background: '#e4d9c0', accent: '#714b3e', frameColor: '#f7ecd5', frameStyle: 'film',
    borderRadius: 2, borderThickness: 10, padding: 40, spacing: 18, fontFamily: '"Playfair Display", serif',
    fontStyle: 'normal', caption: 'Christmas memories • 2026', decorations: ['🔔', '🌿', '⭐', '🔴'], texture: 'grain', filter: 'retro', layouts: allLayouts,
  },
  {
    id: 'winter-wonderland', category: 'christmas', name: 'Winter Wonderland', emoji: '❄️', description: 'Icy blue snowflakes and frosty white frames.',
    background: '#e2eff7', accent: '#527b9c', frameColor: '#fbfdff', frameStyle: 'botanical',
    borderRadius: 13, borderThickness: 4, padding: 39, spacing: 17, fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic', caption: 'let it snow ❄️', decorations: ['❄️', '⭐', '☃️', '🌲'], texture: 'sparkle', filter: 'glow', layouts: allLayouts,
  },
  {
    id: 'classic-christmas', category: 'christmas', name: 'Classic Christmas', emoji: '🔔', description: 'Traditional holly, bright red, and forest green.',
    background: '#f0e5d5', accent: '#8f2f32', frameColor: '#236148', borderColors: ['#a83236', '#236148'], frameStyle: 'classic',
    borderRadius: 7, borderThickness: 6, padding: 38, spacing: 16, fontFamily: '"Playfair Display", serif',
    fontStyle: 'normal', caption: 'merry & bright ❤️', decorations: ['🌿', '🔔', '🍬', '🎀'], texture: 'none', filter: 'warm', layouts: allLayouts,
  },
]

export const getStripDesign = (id: string) => stripDesigns.find(design => design.id === id) ?? stripDesigns[0]
