export type Category = 'wedding' | 'corporate' | 'birthday' | 'hospitality' | 'minimal'
export type Fit = 'contain' | 'cover'
export const CATEGORIES: { id: Category; name: string; title: string; sub: string; bg: [string, string]; ink: string; accent: string }[] = [
  { id: 'wedding', name: 'Wedding Collection', title: 'Wedding', sub: 'Your Names · Your Date', bg: ['#fbeee9', '#f2d3cc'], ink: '#8a3b3b', accent: '#c9786a' },
  { id: 'corporate', name: 'Corporate Branding', title: 'Your Brand', sub: 'Logo · Tagline', bg: ['#0a1a3a', '#3470de'], ink: '#ffffff', accent: '#22e0ff' },
  { id: 'birthday', name: 'Birthday & Celebration', title: 'Celebrate', sub: 'Birthdays · Parties', bg: ['#fff4d6', '#ffd1e0'], ink: '#7a2a5c', accent: '#e0467c' },
  { id: 'hospitality', name: 'Restaurant & Hotel', title: 'Your Café', sub: 'Hotels · Restaurants', bg: ['#1d2b24', '#2f4a3c'], ink: '#f5ead2', accent: '#d8b66a' },
  { id: 'minimal', name: 'Minimal & Personalised', title: 'Your Name', sub: 'Clean & simple', bg: ['#ffffff', '#e8eef3'], ink: '#0a1a3a', accent: '#19b5e8' },
]

// Draws ONLY the customer's design (no VAYU AQUA branding), like the wedding label.
// `aspect` = physical label width / height, so artwork is never stretched on the bottle.
export function drawLabel(cat: Category, img: HTMLImageElement | null, fit: Fit, aspect = 1.4) {
  const B = 1024, W = Math.round(aspect >= 1 ? B : B * aspect), H = Math.round(aspect >= 1 ? B / aspect : B)
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const g = c.getContext('2d')!, m = Math.min(W, H)
  if (img) {
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H)
    const pad = fit === 'cover' ? 0 : m * .06, pw = W - 2 * pad, ph = H - 2 * pad
    const s = (fit === 'cover' ? Math.max : Math.min)(pw / img.width, ph / img.height), w = img.width * s, h = img.height * s
    g.save(); g.beginPath(); g.rect(pad, pad, pw, ph); g.clip(); g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h); g.restore()
    return c
  }
  const d = CATEGORIES.find(x => x.id === cat)!, gr = g.createLinearGradient(0, 0, W, H)
  gr.addColorStop(0, d.bg[0]); gr.addColorStop(1, d.bg[1]); g.fillStyle = gr; g.fillRect(0, 0, W, H)
  g.strokeStyle = d.accent; g.lineWidth = m * .006; g.strokeRect(m * .05, m * .05, W - m * .1, H - m * .1)
  g.textAlign = 'center'; g.fillStyle = d.ink
  let fs = m * .14; g.font = `700 ${fs}px Sora, sans-serif`
  while (g.measureText(d.title).width > W * .8 && fs > 20) { fs -= 4; g.font = `700 ${fs}px Sora, sans-serif` }
  g.fillText(d.title, W / 2, H / 2)
  g.fillStyle = d.accent; g.font = `500 ${m * .055}px Inter, sans-serif`; g.fillText(d.sub, W / 2, H / 2 + m * .14)
  return c
}