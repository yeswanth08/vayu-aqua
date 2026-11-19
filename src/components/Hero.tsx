import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { CATEGORIES } from '../utils/labelTexture'
import type { Customization } from '../hooks/useBottleCustomization'
const Bottle3D = lazy(() => import('./Bottle3D'))

export default function Hero({ c }: { c: Customization }) {
  return (
    <section id="home" className="relative overflow-hidden bg-midnight pt-20 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,rgba(34,224,255,.22),transparent_60%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-4 px-5 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-2">
        <motion.div className="order-2 pb-16 lg:order-1" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}>
          <p className="mb-4 text-xs font-semibold tracking-[.3em] text-cyan">PURE HYDRATION With PREMIUM EXPERIENCE.</p>
          <h1 className="font-display text-4xl font-bold leading-[1.08] sm:text-5xl xl:text-6xl">Your Brand. Your Bottle. <span className="bg-gradient-to-r from-aqua to-cyan bg-clip-text text-transparent">Your Experience.</span></h1>
          <p className="mt-5 max-w-lg text-lg text-slate-300">Turn ordinary water bottles into something memorable. Personalised water bottles for businesses, celebrations, and every special occasion.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#customise" className="rounded-full bg-gradient-to-r from-aqua to-cyan px-7 py-3.5 font-semibold text-midnight shadow-[0_0_30px_rgba(34,224,255,.35)] transition hover:scale-105">Create Your Bottle</a>
            <a href="#services" className="rounded-full border border-white/25 px-7 py-3.5 font-semibold transition hover:bg-white/10">Explore Our Services</a>
          </div>
          <div className="mt-8 flex flex-wrap gap-2" aria-label="Try a demo design">
            {CATEGORIES.map(d => <button key={d.id} onClick={() => c.pickCategory(d.id)} className={`min-h-11 rounded-full border px-4 text-sm transition ${c.category === d.id && !c.image ? 'border-cyan bg-cyan/15 text-cyan' : 'border-white/15 text-slate-300 hover:border-white/40'}`}>{d.name.split(' ')[0]}</button>)}
          </div>
        </motion.div>
        <div className="order-1 h-[56vh] min-h-[380px] lg:order-2 lg:h-[80vh]">
          <Suspense fallback={<div className="h-full animate-pulse rounded-3xl bg-white/5" />}><Bottle3D c={c} /></Suspense>
        </div>
      </div>
      <a href="#customise" aria-label="Scroll down" className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 animate-bounce text-white/60 lg:block"><ChevronDown /></a>
    </section>
  )
}
