import { useEffect, type MutableRefObject } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { dataUrlToFile } from '../utils/uploadImage'

export type Snap = MutableRefObject<(() => File | null) | null>

// Renders the bottle from a fixed front camera onto a navy background and returns a PNG file.
// Lives inside <Canvas>; the parent calls snap.current() from a click handler.
export default function Capture({ snap }: { snap: Snap }) {
  const { gl, scene, size } = useThree()
  useEffect(() => {
    snap.current = () => {
      const cam = new THREE.PerspectiveCamera(30, size.width / size.height, .1, 100)
      cam.position.set(0, .4, 12); cam.lookAt(0, 0, 0)
      gl.render(scene, cam)
      const W = 1080, H = Math.round(W * size.height / size.width), c = document.createElement('canvas'); c.width = W; c.height = H
      const g = c.getContext('2d')!, gr = g.createLinearGradient(0, 0, 0, H)
      gr.addColorStop(0, '#0a1a3a'); gr.addColorStop(1, '#050d1f'); g.fillStyle = gr; g.fillRect(0, 0, W, H)
      g.drawImage(gl.domElement, 0, 0, W, H)
      return dataUrlToFile(c.toDataURL('image/png'), 'vayu-aqua-bottle.png')
    }
    return () => { snap.current = null }
  }, [gl, scene, size, snap])
  return null
}