import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Lightformer, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { RotateCcw } from 'lucide-react'
import { drawLabel } from '../utils/labelTexture'
import type { Customization, Size } from '../hooks/useBottleCustomization'

const DIM: Record<Size, { R: number; H: number }> = { '200': { R: .8, H: .9 }, '500': { R: .9, H: 1.6 }, '1000': { R: 1, H: 2.2 } }
type P = [number, number]
const v2 = (p: P[]) => p.map(([x, y]) => new THREE.Vector2(x, y))
const hasWebGL = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } }

// PET bottle profile (radius, height): punted base, grip grooves, straight label zone, shoulder, neck.
function shape(R: number, H: number) {
  const w = .8 * R, lb = .5 + .1 * H, lt = .5 + .9 * H, S = lt + .3
  const groove = (y: number): P[] => [[w, y], [w * .93, y + .06], [w, y + .12]]
  const pts: P[] = [[0, .14], [.3 * R, .12], [.5 * R, .03], [.62 * R, 0], [.72 * R, .03], [.78 * R, .14], [w, .3],
    ...groove(lb - .22), [w, lb], [w, lt], ...groove(lt + .06), [w, S],
    [.76 * R, S + .18], [.6 * R, S + .5], [.42 * R, S + .8], [.35, S + 1], [.34, S + 1.1], [.34, S + 1.3]]
  return { pts, w, lb, lt, S, top: S + 1.3 }
}
// Radial ridges (cap knurling) between heights y0..y1.
function ridged(g: THREE.BufferGeometry, y0: number, y1: number, n: number, amp: number) {
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i)
    if (y > y0 && y < y1) { const k = 1 + amp * Math.cos(Math.atan2(p.getZ(i), p.getX(i)) * n); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) }
  }
  g.computeVertexNormals(); return g
}

function Bottle({ c, fonts, hq }: { c: Customization; fonts: number; hq: boolean }) {
  const { R, H } = DIM[c.size]
  const { pts, w, lb, lt, S, top } = useMemo(() => shape(R, H), [R, H])
  const total = top + .1, seg = hq ? 96 : 64
  const outer = useMemo(() => new THREE.LatheGeometry(v2(pts), seg), [pts, seg])
  const water = useMemo(() => new THREE.LatheGeometry(v2([...pts.filter(p => p[1] <= S + .8).map(([x, y]): P => [x * .965, y + .01]), [0, S + .8]]), seg), [pts, S, seg])
  const cap = useMemo(() => ridged(new THREE.LatheGeometry(v2([[.43, 0], [.41, .05], [.41, .34], [.38, .4], [0, .4]]), 144), .06, .33, 36, .014), [])
  const tex = useMemo(() => { const t = new THREE.CanvasTexture(drawLabel(c.category, c.image, c.fit)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }, [c.category, c.image, c.fit, fonts])
  useEffect(() => () => tex.dispose(), [tex])
  useEffect(() => () => { outer.dispose(); water.dispose() }, [outer, water])
  useEffect(() => () => cap.dispose(), [cap])

  const g = useRef<THREE.Group>(null), k = useRef(.9)
  useEffect(() => { k.current = .93 }, [c.size]) // small "pop" when the size changes
  useFrame((_, dt) => { k.current += (1 - k.current) * Math.min(1, dt * 6); g.current?.scale.setScalar(k.current) })

  const labelH = lt - lb, labelY = (lb + lt) / 2
  return (
    <group position={[0, -total / 2, 0]}>
      <ContactShadows position={[0, .005, 0]} opacity={.4} blur={3} scale={8} far={total + 1} resolution={512} color="#00122e" />
      <group ref={g}>
        {/* water, then plastic wall on top so reflections sit over the water */}
        <mesh geometry={water} renderOrder={1}><meshPhysicalMaterial color="#8fdcff" transparent opacity={.3} roughness={.02} clearcoat={1} envMapIntensity={1.3} depthWrite={false} /></mesh>
        <mesh geometry={outer} renderOrder={2}><meshPhysicalMaterial color="#eaf7ff" transparent opacity={.14} roughness={.03} clearcoat={1} clearcoatRoughness={.03} ior={1.45} envMapIntensity={1.7} side={THREE.DoubleSide} depthWrite={false} /></mesh>
        {/* label: artwork on the outside, ivory paper on the inside (seen through the bottle) */}
        <mesh position={[0, labelY, 0]} rotation={[0, Math.PI, 0]}><cylinderGeometry args={[w + .012, w + .012, labelH, 96, 1, true]} /><meshPhysicalMaterial map={tex} roughness={.55} clearcoat={.25} /></mesh>
        <mesh position={[0, labelY, 0]} rotation={[0, Math.PI, 0]}><cylinderGeometry args={[w + .012, w + .012, labelH, 96, 1, true]} /><meshStandardMaterial color="#f3efe6" roughness={.85} side={THREE.BackSide} /></mesh>
        {/* neck finish: support ring, tamper ring, knurled cap */}
        <mesh position={[0, top - .46, 0]}><cylinderGeometry args={[.44, .44, .04, 48]} /><meshPhysicalMaterial color="#f2f9ff" roughness={.25} clearcoat={.6} /></mesh>
        <mesh position={[0, top - .36, 0]}><cylinderGeometry args={[.39, .39, .07, 48]} /><meshPhysicalMaterial color="#f7fbff" roughness={.4} /></mesh>
        <mesh geometry={cap} position={[0, top - .3, 0]}><meshPhysicalMaterial color="#f7fbff" roughness={.35} clearcoat={.35} clearcoatRoughness={.25} /></mesh>
      </group>
    </group>
  )
}

export default function Bottle3D({ c }: { c: Customization }) {
  const wrap = useRef<HTMLDivElement>(null), ctl = useRef<any>(null), idle = useRef<number | undefined>(undefined)
  const [vis, setVis] = useState(true), [fonts, setFonts] = useState(0)
  const ok = useMemo(hasWebGL, [])
  const still = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const small = useMemo(() => matchMedia('(max-width: 768px)').matches, [])
  const hq = useMemo(() => !small && (navigator.hardwareConcurrency ?? 8) >= 6, [small])
  const [auto, setAuto] = useState(!still)
  useEffect(() => { const o = new IntersectionObserver(([e]) => setVis(e.isIntersecting)); o.observe(wrap.current!); return () => o.disconnect() }, [])
  useEffect(() => { document.fonts?.ready.then(() => setFonts(1)) }, [])
  useEffect(() => () => clearTimeout(idle.current), [])
  return (
    <div ref={wrap} className="relative h-full w-full cursor-grab active:cursor-grabbing">
      {ok ? (
        <Canvas dpr={small ? [1, 1.25] : [1, 2]} camera={{ position: [0, .4, 12], fov: 30 }} frameloop={vis ? 'always' : 'never'} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
          <ambientLight intensity={.25} />
          <directionalLight position={[4, 6, 5]} intensity={.9} />
          <spotLight position={[0, 4, -6]} angle={.5} penumbra={1} intensity={60} color="#22e0ff" />
          {/* studio softboxes: tall side strips give the long highlights seen on real product shots */}
          <Environment resolution={512} frames={1}>
            <Lightformer form="rect" intensity={6} color="#ffffff" position={[-5, 0, 3]} scale={[1.2, 9, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={6} color="#ffffff" position={[5, 0, 3]} scale={[1.2, 9, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={3} position={[0, 5, 2]} scale={[10, 2, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={2} position={[0, 2, 8]} scale={[8, 3, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={3} color="#22e0ff" position={[0, -1, -6]} scale={[10, 6, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={.6} color="#0a3a7a" position={[0, -5, 0]} scale={[10, 10, 1]} target={[0, 0, 0]} />
          </Environment>
          <Bottle c={c} fonts={fonts} hq={hq} />
          <OrbitControls ref={ctl} makeDefault enablePan={false} enableDamping rotateSpeed={.8} minDistance={7} maxDistance={16} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.7} autoRotate={auto} autoRotateSpeed={1.4}
            onStart={() => { clearTimeout(idle.current); setAuto(false) }}
            onEnd={() => { idle.current = window.setTimeout(() => setAuto(!still), 2500) }} />
        </Canvas>
      ) : <img src="/images/logo.png" alt="VAYU AQUA" className="mx-auto h-full object-contain" />}
      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs tracking-widest text-cyan/90 backdrop-blur">DRAG TO EXPLORE 360°</p>
      <button onClick={() => { ctl.current?.reset(); setAuto(!still) }} aria-label="Reset bottle view" className="absolute right-3 top-3 grid size-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur hover:bg-white/20"><RotateCcw size={18} /></button>
    </div>
  )
}