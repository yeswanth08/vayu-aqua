import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Lightformer, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { RotateCcw } from 'lucide-react'
import { drawLabel } from '../utils/labelTexture'
import type { Customization, Size } from '../hooks/useBottleCustomization'

type P = [number, number]
const v2 = (p: P[]) => p.map(([x, y]) => new THREE.Vector2(x, y))
const hasWebGL = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } }

// The client's bottle: straight body, round dome shoulder, short neck, black ribbed cap, dimpled base.
// Neck + cap are identical on every size (like real bottles); only body radius/length change.
const SZ: Record<Size, { r: number; L: number }> = {
  '200': { r: 0.60, L: 2 },
  '500': { r: 0.78, L: 3 },
  '1000': { r: 0.88, L: 3.8 }
}
// const SZ: Record<Size, { r: number; L: number }> = { '200': { r: .72, L: 1.7 }, '500': { r: .84, L: 2.8 }, '1000': { r: .96, L: 3.9 } }
// const NECK = .30, ARC = Math.PI * .80, FIT = .8 // label arc (108°), global display scale
const NECK = 0.3; // Slightly slimmer neck to match the tall, narrow cap silhouette
const ARC = Math.PI * 0.65, FIT = 1;

function shape(r: number, L: number) {
  const yS = .32 + L // top of straight body
    const pts: P[] = [
    [0, 0.10],
    [0.12 * r, 0.055],
    [0.35 * r, 0.025],
    [0.65 * r, 0.015],
    [0.85 * r, 0.025],
    [0.94 * r, 0.07],
    [0.985 * r, 0.16],
    [r, 0.32],
    [r, yS]
  ]
  // const pts: P[] = [[0, .1], [.1, .06], [.35 * r, .04], [.62 * r, 0], [.8 * r, 0], [.92 * r, .05], [.98 * r, .15], [r, .32], [r, yS]]
  const a1 = Math.acos(NECK / r), sh = 1.3 * r

    for (let i = 1; i <= 32; i++) {
      const a = a1 * i / 32

      pts.push([
        r * Math.cos(a),
        yS + sh * Math.sin(a)
      ])
    }

    const yTop = yS + sh * Math.sin(a1)
    const nk = yTop + 0.12

    // Continuous narrow neck
    pts.push(
      [NECK, nk + 0.1]
    )
  return { pts, yS, yTop, nk, total: nk + .5 }
}
function ridged(g: THREE.BufferGeometry, y0: number, y1: number, n: number, amp: number) {
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i)
    if (y > y0 && y < y1) { const k = 1 + amp * Math.cos(Math.atan2(p.getZ(i), p.getX(i)) * n); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) }
  }
  g.computeVertexNormals(); return g
}
const CLEAR = { color: '#eaf7ff', transparent: true, roughness: .03, clearcoat: 1, clearcoatRoughness: .03, envMapIntensity: 1.7, depthWrite: false } as const

function Bottle({ c, fonts, hq, intro }: { c: Customization; fonts: number; hq: boolean; intro: boolean }) {
  const { r, L } = SZ[c.size]
  const m = useMemo(() => shape(r, L), [r, L])
  const seg = hq ? 128 : 96

  const lb = 0.35
  const lt = m.yS
  const lh = lt - lb

  // Slightly narrower label wrapping
  const labelArc = ARC * 0.94

  // Match label texture to physical dimensions
  const aspect = (r * labelArc) / lh

  // Keep label very close to the bottle surface
  const labelRadius = r + 0.003
  // const seg = hq ? 160 : 96, lb = .55, lt = m.yS - .1, lh = lt - lb, aspect = (r * ARC) / lh
  const outer = useMemo(() => new THREE.LatheGeometry(v2(m.pts), seg), [m, seg])
  const water = useMemo(() => new THREE.LatheGeometry(v2([...m.pts.filter(p => p[1] <= m.yTop).map(([x, y]): P => [x * .965, y + .01]), [NECK * .965, m.nk - .1], [0, m.nk - .1]]), seg), [m, seg])
  const cap = useMemo(() =>
    ridged(
      new THREE.LatheGeometry(
        v2([
          [0.31, 0],
          [0.305, 0.035],
          [0.305, 0.30],
          [0.29, 0.36],
          [0, 0.36]
        ]),
        144
      ),
      0.06,
      0.29,
      36,
      0.008
    ),
    []
  )
  // const cap = useMemo(() => ridged(new THREE.LatheGeometry(v2([[.43, 0], [.41, .05], [.41, .34], [.38, .4], [0, .4]]), 144), .06, .33, 36, .014), [])
  const tex = useMemo(() => { const t = new THREE.CanvasTexture(drawLabel(c.category, c.image, c.fit, aspect)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }, [c.category, c.image, c.fit, aspect, fonts])
  useEffect(() => () => tex.dispose(), [tex])
  useEffect(() => () => { outer.dispose(); water.dispose() }, [outer, water])
  useEffect(() => () => cap.dispose(), [cap])

  const g = useRef<THREE.Group>(null), k = useRef(.93), t0 = useRef(intro ? 0 : 1)
  useEffect(() => { k.current = .93 }, [c.size]) // small "pop" on size change
  useFrame((_, dt) => {
    k.current += (1 - k.current) * Math.min(1, dt * 6)
    t0.current = Math.min(1, t0.current + dt / 1.6)
    const e = 1 - Math.pow(1 - t0.current, 3) // intro: spin in + rise
    if (g.current) { g.current.rotation.y = -(1 - e) * Math.PI * 1.2; g.current.scale.setScalar(FIT * k.current * (.85 + .15 * e)) }
  })

  // const labelGeo = <cylinderGeometry args={[r + .012, r + .012, lh, 64, 1, true, -ARC / 2, ARC]} />
  const labelGeo = (
  <cylinderGeometry
    args={[
      labelRadius,
      labelRadius,
      lh,
      128,
      1,
      true,
      -labelArc / 2,
      labelArc
    ]}
  />
)
  return (
    <group position={[0, -m.total * FIT / 2, 0]}>
      <ContactShadows position={[0, .005, 0]} opacity={.4} blur={3} scale={8} far={m.total + 1} resolution={512} color="#00122e" />
      <group ref={g}>
        <mesh geometry={water} renderOrder={1}><meshPhysicalMaterial color="#8fdcff" transparent opacity={.28} roughness={.02} clearcoat={1} envMapIntensity={1.3} depthWrite={false} /></mesh>
        <mesh geometry={outer} renderOrder={2}><meshPhysicalMaterial {...CLEAR} opacity={.14} ior={1.45} side={THREE.DoubleSide} /></mesh>
        {/* front label (customer design only); ivory paper on the inside */}
        <mesh
          position={[0, (lb + lt) / 2, 0]}
          renderOrder={3}
        >
          {labelGeo}
          <meshPhysicalMaterial
            map={tex}
            roughness={0.65}
            clearcoat={0.1}
            side={THREE.FrontSide}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>
        {/* <mesh position={[0, (lb + lt) / 2, 0]}>{labelGeo}<meshPhysicalMaterial map={tex} roughness={.55} clearcoat={.25} /></mesh> */}
        <mesh position={[0, (lb + lt) / 2, 0]}>{labelGeo}<meshStandardMaterial color="#f3efe6" roughness={.85} side={THREE.BackSide} /></mesh>
        {/* neck finish: clear support ring + black ribbed cap */}
        <mesh position={[0, m.nk, 0]} renderOrder={2}>
        <cylinderGeometry args={[0.2, 0.38, 0.01, 20]} />
        <meshPhysicalMaterial
          color="#e9ecee"
          transparent
          opacity={0.22}
          roughness={0.08}
          clearcoat={1}
        />
      </mesh>
        {/* <mesh position={[0, m.nk, 0]} renderOrder={2}><cylinderGeometry args={[.46, .46, .05, 48]} /><meshPhysicalMaterial {...CLEAR} opacity={.35} /></mesh> */}
        <mesh
          geometry={cap}
          position={[0, m.nk + 0.06, 0]}
        >
          <meshPhysicalMaterial
            color="#564b4b"
            roughness={0.35}
            clearcoat={0.5}
            clearcoatRoughness={0.3}
          />
        </mesh>
        {/* <mesh geometry={cap} position={[0, m.nk + .06, 0]}><meshPhysicalMaterial color="#0b0d12" roughness={.3} clearcoat={.6} clearcoatRoughness={.2} /></mesh> */}
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
          <Environment resolution={512} frames={1}>
            <Lightformer form="rect" intensity={6} color="#ffffff" position={[-5, 0, 3]} scale={[1.2, 9, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={6} color="#ffffff" position={[5, 0, 3]} scale={[1.2, 9, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={3} position={[0, 5, 2]} scale={[10, 2, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={2} position={[0, 2, 8]} scale={[8, 3, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={3} color="#22e0ff" position={[0, -1, -6]} scale={[10, 6, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={.6} color="#0a3a7a" position={[0, -5, 0]} scale={[10, 10, 1]} target={[0, 0, 0]} />
          </Environment>
          <Bottle c={c} fonts={fonts} hq={hq} intro={!still} />
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