// lib/ocr-utils.ts

export const preprocessImage = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const width = canvas.width
  const height = canvas.height
  
  // Create new canvas for processed image
  const processedCanvas = document.createElement('canvas')
  processedCanvas.width = width
  processedCanvas.height = height
  const processedCtx = processedCanvas.getContext('2d')
  
  if (!processedCtx) return canvas
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  
  // Increase contrast and binarize
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const brightness = (r + g + b) / 3
    
    // Convert to black and white based on threshold
    const threshold = 128
    const value = brightness > threshold ? 255 : 0
    data[i] = value     // R
    data[i + 1] = value // G
    data[i + 2] = value // B
  }
  
  processedCtx.putImageData(imageData, 0, 0)
  
  // Add white border for better recognition
  processedCtx.fillStyle = 'white'
  processedCtx.fillRect(0, 0, width, height)
  processedCtx.drawImage(canvas, 10, 10, width - 20, height - 20)
  
  return processedCanvas
}