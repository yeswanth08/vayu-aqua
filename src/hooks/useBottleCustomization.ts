import { useCallback, useState } from 'react'
import type { Category, Fit } from '../utils/labelTexture'
export type Size = '200' | '500' | '1000'
export const SIZES: { id: Size; label: string }[] = [{ id: '200', label: '200 ml' }, { id: '500', label: '500 ml' }, { id: '1000', label: '1 Litre' }]
const OK = ['image/png', 'image/jpeg']

export function useBottleCustomization() {
  const [size, setSize] = useState<Size>('500')
  const [category, setCategory] = useState<Category>('corporate')
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [fit, setFit] = useState<Fit>('contain')
  const [error, setError] = useState('')

  const upload = useCallback((f: File) => {
    setError('')
    if (!OK.includes(f.type)) return setError('Unsupported file. Please upload a PNG, JPG or JPEG image.')
    if (f.size > 8 * 1024 * 1024) return setError('That image is over 8 MB. Please choose a smaller file.')
    const url = URL.createObjectURL(f), im = new Image()
    im.onload = () => { setImage(im); setFileName(f.name); setPreviewUrl(p => { if (p) URL.revokeObjectURL(p); return url }) }
    im.onerror = () => { URL.revokeObjectURL(url); setError('That image could not be read. Please try another file.') }
    im.src = url
  }, [])
  const clear = useCallback(() => { setImage(null); setFileName(''); setPreviewUrl(p => { if (p) URL.revokeObjectURL(p); return '' }) }, [])
  const pickCategory = useCallback((c: Category) => { setCategory(c); clear(); setError('') }, [clear])
  return { size, setSize, category, pickCategory, image, previewUrl, fileName, fit, setFit, error, upload, clear }
}
export type Customization = ReturnType<typeof useBottleCustomization>
