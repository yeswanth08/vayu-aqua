export type Category = 'wedding' | 'corporate' | 'birthday' | 'hospitality' | 'minimal'
export type Fit = 'contain' | 'cover'
export const CATEGORIES: { id: Category; name: string; title: string; sub: string; bg: [string, string]; ink: string; accent: string }[] = [
  { id: 'wedding', name: 'Wedding Collection', title: 'Wedding', sub: 'Your Names · Your Date', bg: ['#fbeee9', '#f2d3cc'], ink: '#8a3b3b', accent: '#c9786a' },
  { id: 'corporate', name: 'Corporate Branding', title: 'YOUR BRAND', sub: 'Logo · Tagline', bg: ['#0a1a3a', '#15387a'], ink: '#ffffff', accent: '#22e0ff' },
  { id: 'birthday', name: 'Birthday & Celebration', title: 'Celebrate', sub: 'Birthdays · Parties', bg: ['#fff4d6', '#ffd1e0'], ink: '#7a2a5c', accent: '#e0467c' },
  { id: 'hospitality', name: 'Restaurant & Hotel', title: 'Your Café', sub: 'Hotels · Restaurants', bg: ['#1d2b24', '#2f4a3c'], ink: '#f5ead2', accent: '#d8b66a' },
  { id: 'minimal', name: 'Minimal & Personalised', title: 'Your Name', sub: 'Clean & simple', bg: ['#ffffff', '#e8eef3'], ink: '#0a1a3a', accent: '#19b5e8' },
]
// Canvas = full label wrap (3:1). Front panel sits at the centre so it faces the camera.
export function drawLabel(cat: Category, img: HTMLImageElement | null, fit: Fit) {
  const W = 1536, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H
  const g = c.getContext('2d')!, d = CATEGORIES.find(x => x.id === cat)!, gr = g.createLinearGradient(0, 0, W, H)
  gr.addColorStop(0, d.bg[0]); gr.addColorStop(1, d.bg[1]); g.fillStyle = gr; g.fillRect(0, 0, W, H)
  g.textAlign = 'center'; g.fillStyle = d.ink
  for (const x of [W * .13, W * .87]) { g.font = '700 46px Sora, sans-serif'; g.fillText('VAYU AQUA', x, H / 2); g.font = '500 22px Inter, sans-serif'; g.fillText('PURE HYDRATION', x, H / 2 + 36) }
  const pw = 640, ph = 448, px = (W - pw) / 2, py = 32
  g.beginPath(); g.roundRect(px, py, pw, ph, 28)
  if (img) {
    g.fillStyle = '#fff'; g.fill(); g.save(); g.clip()
    const s = (fit === 'cover' ? Math.max : Math.min)(pw / img.width, ph / img.height), w = img.width * s, h = img.height * s
    g.drawImage(img, px + (pw - w) / 2, py + (ph - h) / 2, w, h); g.restore()
  } else {
    g.strokeStyle = d.accent; g.lineWidth = 4; g.stroke()
    g.fillStyle = d.ink; g.font = '700 80px Sora, sans-serif'; g.fillText(d.title, W / 2, H / 2 - 6)
    g.fillStyle = d.accent; g.font = '500 30px Inter, sans-serif'; g.fillText(d.sub, W / 2, H / 2 + 50)
    g.font = '500 18px Inter, sans-serif'; g.fillText('SAMPLE DESIGN', W / 2, py + ph - 28)
  }
  return c
}
