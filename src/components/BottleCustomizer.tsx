import { lazy, Suspense, useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { CATEGORIES } from '../utils/labelTexture'
import { SIZES, type Customization } from '../hooks/useBottleCustomization'
import { waLink } from '../utils/whatsapp'
import { uploadImage } from '../utils/uploadImage'
import { type Snap } from './Capture'
import { Reveal } from './Sections'
const Bottle3D = lazy(() => import('./Bottle3D'))
const chip = (on: boolean) => `min-h-11 rounded-xl border px-4 text-sm font-medium transition ${on ? 'border-aqua bg-aqua text-white' : 'border-slate-300 bg-white text-navy hover:border-aqua'}`

export default function BottleCustomizer({ c }: { c: Customization; snap?: Snap  }) {
  const file = useRef<HTMLInputElement>(null), snap: Snap = useRef(null)
  const [busy, setBusy] = useState(false)
  const msg  = `🙏 *Namaskaram Vayu Aqua!* 💧\n\nI'm interested in creating a *bespoke customised bottle.*\n\n📦 *BOTTLE SIZE:* ${SIZES.find(s => s.id === c.size)!.label}\n\n✨ I'd love to explore the customisation possibilities, available finishes, and pricing.\n\nCould you please share the details and guide me through the next steps?\n\nLooking forward to creating something unique with *Vayu Aqua!* 🤝\n`
  const enquire = async () => {
    setBusy(true)
    const w = window.open('about:blank', '_blank') // opened inside the click so popup blockers allow itmsg
    let url: string | null = null
    try {
      const shot = snap.current?.()
      // upload the bottle preview, but never wait more than 6s: the enquiry must always go out
      if (shot) url = await Promise.race([uploadImage(shot, shot.name), new Promise<null>(r => setTimeout(() => r(null), 6000))])
    } catch { /* send the enquiry without a preview link */ }
    const link = waLink(msg + (url ? `\nBottle preview: ${url}` : ''))
    if (w) w.location.href = link; else window.location.href = link
    setBusy(false)
  }

  return (
    <section id="customise" className="bg-ice py-20 text-navy">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal><h2 className="font-display text-3xl font-bold sm:text-4xl">Imagine It. Customise It. Make It Yours.</h2>
          <p className="mt-3 max-w-2xl text-slate-600">Pick a size, choose a design or upload your own artwork — the 3D bottle updates instantly. Your artwork stays in your browser until you send an enquiry.</p></Reveal>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="h-[460px] rounded-3xl bg-gradient-to-b from-navy to-midnight shadow-2xl lg:h-[600px]"><Suspense fallback={null}><Bottle3D c={c} snap={snap} /></Suspense></div>
          <div className="space-y-7">
            <div><h3 className="mb-3 font-semibold">Bottle size</h3><div className="flex flex-wrap gap-2">{SIZES.map(s => <button key={s.id} onClick={() => c.setSize(s.id)} className={chip(c.size === s.id)}>{s.label}</button>)}</div></div>
            <div><h3 className="mb-3 font-semibold">Design</h3><div className="flex flex-wrap gap-2">{CATEGORIES.map(d => <button key={d.id} onClick={() => c.pickCategory(d.id)} className={chip(c.category === d.id && !c.image)}>{d.name}</button>)}</div></div>
            <div><h3 className="mb-3 font-semibold">Your artwork</h3>
              <input ref={file} type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" hidden onChange={e => { const f = e.target.files?.[0]; if (f) c.upload(f); e.target.value = '' }} />
              <button onClick={() => file.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) c.upload(f) }} className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-aqua/50 bg-white px-4 py-8 text-slate-600 transition hover:border-aqua"><Upload className="text-aqua" /><span>Tap to upload or drop a logo, photo or label (PNG / JPG)</span></button>
              {c.error && <p role="alert" className="mt-2 text-sm font-medium text-red-600">{c.error}</p>}
              {c.previewUrl && <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white p-3">
                <img src={c.previewUrl} alt="Upload preview" className="size-16 rounded-lg object-contain ring-1 ring-slate-200" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{c.fileName}</p>
                  <div className="mt-1 flex gap-2">{(['contain', 'cover'] as const).map(f => <button key={f} onClick={() => c.setFit(f)} className={`rounded-lg px-3 py-1.5 text-xs ${c.fit === f ? 'bg-navy text-white' : 'bg-ice'}`}>{f === 'contain' ? 'Fit whole image' : 'Fill label'}</button>)}</div></div>
                <button onClick={c.clear} aria-label="Remove image" className="grid size-11 place-items-center rounded-full hover:bg-ice"><X size={18} /></button></div>}
            </div>
            <button onClick={enquire} disabled={busy} className="w-full rounded-full bg-navy py-4 font-semibold text-white shadow-lg transition hover:bg-aqua disabled:opacity-60">{busy ? 'Opening WhatsApp…' : 'Enquire About This Design'}</button>
            <p className="text-xs text-slate-500">When you enquire, a preview picture of your bottle is uploaded so we can see your design.</p>
          </div>
        </div>
      </div>
    </section>
  )
}