export const imageToFile = async (img: HTMLImageElement, fileName: string): Promise<File> => {
  const response = await fetch(img.src)
  const blob = await response.blob()

  return new File([blob], fileName || 'artwork.png', {
    type: blob.type || 'image/png',
  })
}