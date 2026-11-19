
const CLOUD = 'dx6wamcj', PRESET = 'vayu-aqua' 
 
export function dataUrlToFile(url: string, name: string) {
  const bin = atob(url.split(',')[1]), a = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i)
  return new File([a], name, { type: 'image/png' })
}
 
export async function uploadImage(file: Blob, name: string): Promise<string | null> {
  try {
    const f = new FormData(); f.append('file', file, name); f.append('upload_preset', PRESET)
    const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: f })
    return r.ok ? (await r.json()).secure_url : null
  } catch { return null }
}
 