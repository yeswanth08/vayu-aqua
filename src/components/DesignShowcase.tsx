import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORIES, drawLabel, type Category } from '../utils/labelTexture'
import { Reveal } from './Sections'

const Plain = () => <svg viewBox="0 0 300 220" className="h-full max-h-[420px] w-full">{[[30, 120, 44], [110, 90, 58], [200, 55, 72]].map(([x, t, w], i) => <g key={i}><rect x={x + w / 2 - 12} y={t} width="24" height="14" rx="3" fill="#fff" /><rect x={x} y={t + 24} width={w} height={196 - t - 24} rx="18" fill="rgba(125,211,252,.25)" stroke="rgba(255,255,255,.5)" /></g>)}</svg>

export default function DesignShowcase() {
  const [id, setId] = useState<Category>('wedding'), [after, setAfter] = useState(true)
  const art = useMemo(() => Object.fromEntries(CATEGORIES.map(d => [d.id, drawLabel(d.id, null, 'contain').toDataURL('image/jpeg', .85)])) as Record<Category, string>, [])
  const wedding = id === 'wedding'
  return (
    <section id="showcase" className="bg-midnight py-20 text-white">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal><h2 className="font-display text-3xl font-bold sm:text-4xl">From a Simple Bottle to a Personalised Experience.</h2>
          <p className="mt-3 max-w-2xl text-slate-300">See what a finished custom label can look like. Weddings are just one example — we brand bottles for every occasion and business.</p></Reveal>
        <div className="mt-8 flex flex-wrap gap-2">{CATEGORIES.map(d => <button key={d.id} onClick={() => { setId(d.id); setAfter(true) }} className={`min-h-11 rounded-full border px-4 text-sm transition ${id === d.id ? 'border-cyan bg-cyan/15 text-cyan' : 'border-white/15 text-slate-300 hover:border-white/40'}`}>{d.name}</button>)}</div>
        <div className="mt-6 inline-flex rounded-full bg-white/10 p-1">{[false, true].map(a => <button key={String(a)} onClick={() => setAfter(a)} className={`min-h-10 rounded-full px-5 text-sm ${after === a ? 'bg-cyan font-semibold text-midnight' : 'text-slate-300'}`}>{a ? 'After Customisation' : 'Before Customisation'}</button>)}</div>
        <div className="group mt-6 flex min-h-[320px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-[#0d2a5c] p-4 ring-1 ring-white/10">
          <AnimatePresence mode="wait"><motion.div key={id + after} className="flex h-full w-full items-center justify-center" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .35 }}>
            {!after ? <Plain /> : wedding
              ? <img src="/images/wedding-bottles.jpg" alt="Customised wedding water bottles in 200 ml, 500 ml and 1 litre" className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain transition duration-700 group-hover:scale-105" />
              : <img src={art[id]} alt={`${id} sample label artwork`} className="w-full max-w-3xl rounded-xl object-contain transition duration-700 group-hover:scale-105" />}
          </motion.div></AnimatePresence>
        </div>
        <p className="mt-3 text-sm text-slate-400">{wedding ? 'Reference photo: customised 200 ml, 500 ml and 1 litre bottles.' : 'Sample concept artwork — not a completed customer order.'}</p>
      </div>
    </section>
  )
}
