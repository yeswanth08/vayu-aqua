import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Lightformer, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { RotateCcw } from 'lucide-react'
import { drawLabel } from '../utils/labelTexture'
import type { Customization, Size } from '../hooks/useBottleCustomization'

const DIM: Record<Size, { R: number; H: number }> = { '200': { R: .8, H: .9 }, '500': { R: .9, H: 1.6 }, '1000': { R: 1, H: 2.2 } }
// Lathe profile [radius, height]: base, body, shoulder, neck. Neck/cap stay the same size across bottle sizes.
const body = (R: number, H: number): [number, number][] => [[0, 0], [.45 * R, 0], [.62 * R, .05], [.74 * R, .2], [.8 * R, .5], [.8 * R, .5 + H], [.76 * R, .8 + H], [.55 * R, 1.2 + H], [.36, 1.4 + H], [.34, 1.55 + H], [.34, 1.75 + H]]
const v2 = (p: [number, number][]) => p.map(([x, y]) => new THREE.Vector2(x, y))
const hasWebGL = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } }

function Bottle({ c, fonts }: { c: Customization; fonts: number }) {
  const { R, H } = DIM[c.size], total = 1.75 + H + .4
  const pts = useMemo(() => body(R, H), [R, H])
  const water = useMemo(() => [...pts.slice(0, 7).map(([x, y]) => [x * .97, y] as [number, number]), [0, .8 + H] as [number, number]], [pts, H])
  const tex = useMemo(() => { const t = new THREE.CanvasTexture(drawLabel(c.category, c.image, c.fit)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }, [c.category, c.image, c.fit, fonts])
  useEffect(() => () => tex.dispose(), [tex])
  return (
    <group position={[0, -total / 2, 0]}>
      <mesh><latheGeometry args={[v2(pts), 64]} /><meshPhysicalMaterial color="#fff" transparent opacity={.2} roughness={.04} clearcoat={1} envMapIntensity={1.4} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      <mesh><latheGeometry args={[v2(water), 48]} /><meshPhysicalMaterial color="#79d6ff" transparent opacity={.4} roughness={.05} envMapIntensity={1.2} /></mesh>
      <mesh position={[0, .5 + H / 2, 0]} rotation={[0, Math.PI, 0]}><cylinderGeometry args={[.8 * R + .012, .8 * R + .012, H * .8, 64, 1, true]} /><meshStandardMaterial map={tex} roughness={.45} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 1.62 + H, 0]}><torusGeometry args={[.37, .03, 12, 40]} /><meshStandardMaterial color="#e8f6ff" roughness={.3} /></mesh>
      <mesh position={[0, 1.95 + H, 0]}><cylinderGeometry args={[.4, .4, .4, 40]} /><meshStandardMaterial color="#f7fbff" roughness={.35} /></mesh>
    </group>
  )
}

export default function Bottle3D({ c }: { c: Customization }) {
  const wrap = useRef<HTMLDivElement>(null), ctl = useRef<any>(null)
  const [vis, setVis] = useState(true), [fonts, setFonts] = useState(0)
  const ok = useMemo(hasWebGL, [])
  const still = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const small = useMemo(() => matchMedia('(max-width: 768px)').matches, [])
  useEffect(() => { const o = new IntersectionObserver(([e]) => setVis(e.isIntersecting)); o.observe(wrap.current!); return () => o.disconnect() }, [])
  useEffect(() => { document.fonts?.ready.then(() => setFonts(1)) }, [])
  return (
    <div ref={wrap} className="relative h-full w-full">
      {ok ? (
        <Canvas dpr={small ? [1, 1.25] : [1, 1.75]} camera={{ position: [0, 0, 12], fov: 30 }} frameloop={vis ? 'always' : 'never'} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
          <ambientLight intensity={.5} /><directionalLight position={[4, 6, 5]} intensity={1.2} />
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={4} position={[0, 3, 6]} scale={[10, 3, 1]} />
            <Lightformer form="rect" intensity={2.5} position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 6, 1]} />
            <Lightformer form="rect" intensity={2.5} position={[6, 0, 2]} rotation-y={-Math.PI / 2} scale={[8, 6, 1]} />
            <Lightformer form="ring" color="#22e0ff" intensity={2} position={[0, -3, -4]} scale={6} />
          </Environment>
          <Bottle c={c} fonts={fonts} />
          <ContactShadows position={[0, -2.45, 0]} opacity={.5} blur={2.6} scale={9} far={4} color="#00122e" />
          <OrbitControls ref={ctl} makeDefault enablePan={false} enableDamping minDistance={7} maxDistance={16} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.7} autoRotate={!still} autoRotateSpeed={1.4} />
        </Canvas>
      ) : <img src="/images/logo.png" alt="VAYU AQUA" className="mx-auto h-full object-contain" />}
      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs tracking-widest text-cyan/90 backdrop-blur">DRAG TO EXPLORE 360°</p>
      <button onClick={() => ctl.current?.reset()} aria-label="Reset bottle view" className="absolute right-3 top-3 grid size-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur hover:bg-white/20"><RotateCcw size={18} /></button>
    </div>
  )
}
