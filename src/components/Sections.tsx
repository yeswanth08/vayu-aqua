import { useState, type FormEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Boxes, Building2, CalendarHeart, Handshake, MapPin, Menu, MessageCircle, Package, Palette, Phone, Ruler, Sparkles, Wand2, X } from 'lucide-react'
import { openWhatsApp, PHONES } from '../utils/whatsapp'
import type { Customization } from '../hooks/useBottleCustomization'

export const Reveal = ({ children, className = '' }: { children: ReactNode; className?: string }) =>
  <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: .6 }}>{children}</motion.div>
const Mark = () => <span className="font-display font-bold tracking-[.2em]">VAYU <span className="text-aqua">AQUA</span></span>
const LINKS = [['Home', '#home'], ['Customisation', '#customise'], ['Our Services', '#services'], ['Showcase', '#showcase'], ['Contact', '#contact']]

export function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-midnight/70 text-white backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <a href="#home"><Mark /></a>
        <div className="hidden gap-8 text-sm md:flex">{LINKS.map(([t, h]) => <a key={h} href={h} className="text-slate-300 transition hover:text-cyan">{t}</a>)}</div>
        <button className="grid size-11 place-items-center md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </nav>
      {open && <div className="flex flex-col border-t border-white/10 bg-midnight px-5 pb-3 md:hidden">{LINKS.map(([t, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="py-3.5 text-slate-200">{t}</a>)}</div>}
    </header>
  )
}

const SERVICES = [
  { i: Palette, t: 'Customised Water Bottles', d: 'Make every bottle uniquely yours with custom labels, photographs, logos, and personalised designs.' },
  { i: Building2, t: 'Bulk Water Supply', d: 'Reliable packaged drinking water solutions for hotels, restaurants, cafes, and businesses.' },
  { i: CalendarHeart, t: 'Event & Occasion Bottling', d: 'Create memorable experiences with customised water bottles for weddings, corporate events, parties, and celebrations.' },
  { i: Handshake, t: 'Private Label Solutions', d: 'Bring your brand to life with personalised bottle labels and branding solutions for your business.' },
]
export function Services() {
  return (
    <section id="services" className="bg-ice py-20 text-navy"><div className="mx-auto max-w-7xl px-5">
      <Reveal><h2 className="font-display text-3xl font-bold sm:text-4xl">More Than Just Bottled Water.</h2><p className="mt-3 max-w-2xl text-slate-600">From personalised occasions to everyday business branding, we bring your identity to every bottle.</p></Reveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{SERVICES.map(({ i: I, t, d }) =>
        <Reveal key={t}><div className="group h-full overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
          <div className="grid h-36 place-items-center bg-gradient-to-br from-navy to-aqua"><I size={44} className="text-white transition group-hover:scale-110" /></div>
          <div className="p-6"><h3 className="font-display text-lg font-semibold">{t}</h3><p className="mt-2 text-sm text-slate-600">{d}</p></div></div></Reveal>)}</div>
    </div></section>
  )
}

const WHY = [[Sparkles, 'Personalised Branding', 'Your name, logo or photograph on every bottle.'], [Ruler, 'Multiple Bottle Sizes', '200 ml, 500 ml and 1 litre options.'], [CalendarHeart, 'Event-Specific Designs', 'Labels made for weddings, parties and corporate events.'], [Building2, 'Business Branding Solutions', 'Brand identity for hotels, cafes and companies.'], [Boxes, 'Bulk Supply Options', 'Packaged drinking water for regular and large needs.'], [Wand2, 'Custom Design Flexibility', 'Bring your own artwork or let us help shape it.']] as const
export function WhyChooseUs() {
  return (
    <section className="bg-midnight py-20 text-white"><div className="mx-auto max-w-7xl px-5">
      <Reveal><h2 className="font-display text-3xl font-bold sm:text-4xl">Why Choose VAYU AQUA?</h2></Reveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{WHY.map(([I, t, d]) => <Reveal key={t}><div className="h-full rounded-2xl border border-white/10 bg-white/[.03] p-6"><I className="text-cyan" /><h3 className="mt-4 font-semibold">{t}</h3><p className="mt-1 text-sm text-slate-400">{d}</p></div></Reveal>)}</div>
    </div></section>
  )
}

const STEPS = [['Choose Your Bottle', 'Select the required bottle size.'], ['Share Your Design', 'Upload your photograph, logo, artwork, or branding.'], ['Preview Your Bottle', 'Explore the customised design through the interactive 3D model.'], ['Get in Touch', 'Contact VAYU AQUA to discuss your requirements and place an order.']]
export function HowItWorks() {
  return (
    <section className="bg-ice py-20 text-navy"><div className="mx-auto max-w-7xl px-5">
      <Reveal><h2 className="font-display text-3xl font-bold sm:text-4xl">How It Works</h2></Reveal>
      <ol className="mt-10 grid gap-8 lg:grid-cols-4">{STEPS.map(([t, d], n) => <li key={t} className="relative flex gap-4 lg:block"><span className="grid size-12 shrink-0 place-items-center rounded-full bg-navy font-display font-bold text-cyan">{n + 1}</span><div className="lg:mt-4"><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p></div></li>)}</ol>
    </div></section>
  )
}

const inp = 'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan focus:outline-none'
export function Contact({ c }: { c: Customization }) {
  const [err, setErr] = useState<Record<string, string>>({})
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>, er: Record<string, string> = {}
    if (f.name.trim().length < 2) er.name = 'Please enter your name.'
    if (!/^[6-9]\d{9}$/.test(f.phone.replace(/[\s-]/g, ''))) er.phone = 'Enter a valid 10-digit mobile number.'
    if (!(+f.qty > 0)) er.qty = 'Enter an approximate quantity.'
    setErr(er); if (Object.keys(er).length) return
    openWhatsApp(`Hello VAYU AQUA, I'm ${f.name} (${f.phone}).\nService: ${f.service}\nBottle size: ${f.size}\nQuantity: ~${f.qty}\n${f.message ? `Message: ${f.message}` : ''}`)
  }
  return (
    <section id="contact" className="bg-gradient-to-b from-navy to-midnight py-20 text-white"><div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-2">
      <Reveal><h2 className="font-display text-3xl font-bold sm:text-4xl">Let's Create Something Unique.</h2>
        <p className="mt-3 text-slate-300">Have a design in mind? Let's turn it into a personalised water bottle.</p>
        <ul className="mt-8 space-y-4">
          <li className="flex items-center gap-3"><Phone className="text-cyan" /><span>Ajay · Narendra -{PHONES.map((p, i) => <a key={p} href={`tel:+91${p}`} className="ml-2 underline-offset-4 hover:underline">{i ? '/ ' : ''}{p}</a>)}</span></li>
          <li className="flex items-center gap-3"><MapPin className="text-cyan" />Sujatha Nagar, Visakhapatnam, Andhra Pradesh</li></ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`tel:+91${PHONES[0]}`} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-6 font-semibold hover:bg-white/10"><Phone size={18} />Call Now</a>
          <button onClick={() => openWhatsApp(`Hello VAYU AQUA, I'd like to know more about customised bottles. (Size: ${c.size} ml)`)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#25D366] px-6 font-semibold text-midnight"><MessageCircle size={18} />WhatsApp</button></div>
      </Reveal>
      <form onSubmit={submit} noValidate className="space-y-4 rounded-3xl border border-white/10 bg-white/[.04] p-6">
        <div><input name="name" placeholder="Name" className={inp} />{err.name && <p className="mt-1 text-sm text-red-400">{err.name}</p>}</div>
        <div><input name="phone" inputMode="tel" placeholder="Phone number" className={inp} />{err.phone && <p className="mt-1 text-sm text-red-400">{err.phone}</p>}</div>
        <select name="service" className={inp}>{SERVICES.map(s => <option key={s.t} className="text-navy">{s.t}</option>)}</select>
        <div className="grid grid-cols-2 gap-4"><select name="size" defaultValue="500 ml" className={inp}>{['200 ml', '500 ml', '1 Litre'].map(s => <option key={s} className="text-navy">{s}</option>)}</select>
          <div><input name="qty" type="number" min="1" placeholder="Est. quantity" className={inp} />{err.qty && <p className="mt-1 text-sm text-red-400">{err.qty}</p>}</div></div>
        <textarea name="message" rows={3} placeholder="Message" className={inp} />
        <button className="w-full rounded-full bg-gradient-to-r from-aqua to-cyan py-3.5 font-semibold text-midnight">Send Enquiry on WhatsApp</button>
        <center>
        <p className="text-xs text-slate-400">*This opens WhatsApp with your message prefilled. </p>
        </center>
      </form>
    </div></section>
  )
}

export function Footer() {
  return (
    <footer className="bg-black py-12 text-sm text-slate-400"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:flex-row md:justify-between">
      <div><div className="text-lg text-white"><Mark /></div><p className="mt-2">Pure Hydration. Premium Experience.</p><p className="mt-4 flex items-center gap-2"><MapPin size={14} />Visakhapatnam, Andhra Pradesh</p><p className="mt-1"><Package className="mr-2 inline" size={14} />{PHONES.join(' · ')}</p></div>
      <nav className="flex flex-wrap gap-x-6 gap-y-2">{LINKS.map(([t, h]) => <a key={h} href={h} className="hover:text-cyan">{t}</a>)}</nav>
    </div><p className="mt-8 text-center text-xs">© {new Date().getFullYear()} VAYU AQUA. All rights reserved.</p></footer>
  )
}
