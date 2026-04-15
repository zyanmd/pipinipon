"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Crop, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageCropperProps {
  open: boolean
  onClose: () => void
  image: string
  onCropComplete: (croppedImage: File) => void
  aspectRatio?: number
  title?: string
}

export function ImageCropper({
  open,
  onClose,
  image,
  onCropComplete,
  aspectRatio = 1,
  title = "Crop Gambar"
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onRotationChange = (rotation: number) => {
    setRotation(rotation)
  }

  const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation)
      onCropComplete(croppedImage)
      onClose()
    } catch (e) {
      console.error(e)
    }
  }

  const getCroppedImg = (imageSrc: string, pixelCrop: any, rotation: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.src = imageSrc
      image.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('No 2d context'))
          return
        }
        
        // Set canvas size to cropped size
        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height
        
        // Draw cropped image
        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        )
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'))
            return
          }
          const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
          resolve(file)
        }, 'image/jpeg')
      }
      image.onerror = (error) => reject(error)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="relative h-80 w-full bg-muted rounded-lg overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropCompleteCallback}
          />
        </div>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <div className="flex items-center gap-4">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => onZoomChange(value[0])}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Rotasi</label>
            <div className="flex items-center gap-4">
              <RotateCw className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[rotation]}
                min={0}
                max={360}
                step={1}
                onValueChange={(value) => onRotationChange(value[0])}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">{rotation}°</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={createCroppedImage}>
            <Crop className="mr-2 h-4 w-4" />
            Crop & Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}