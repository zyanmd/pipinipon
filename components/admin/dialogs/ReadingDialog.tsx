"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, X } from "lucide-react"
import { readingAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

interface ReadingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedReading?: any
  onSuccess: () => void
}

const getReadingThumbnailUrl = (thumbnail: string | null | undefined): string | null => {
  if (!thumbnail) return null
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.pipinipon.site'
  if (thumbnail.startsWith('http')) return thumbnail
  if (thumbnail.startsWith('/')) return `${baseUrl}${thumbnail}`
  return `${baseUrl}/uploads/readings/${thumbnail}`
}

export function ReadingDialog({ open, onOpenChange, selectedReading, onSuccess }: ReadingDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [readingForm, setReadingForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "artikel",
    level: "N5",
    is_published: 0,
    thumbnail: "",
    thumbnail_alt: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: ""
  })

  // Reset form when selectedReading changes
  useEffect(() => {
    if (selectedReading) {
      console.log("Loading reading data for edit:", selectedReading.id)
      
      setReadingForm({
        title: selectedReading.title || "",
        content: selectedReading.content || "",
        excerpt: selectedReading.excerpt || "",
        category: selectedReading.category || "artikel",
        level: selectedReading.level || "N5",
        is_published: selectedReading.is_published || 0,
        thumbnail: selectedReading.thumbnail || "",
        thumbnail_alt: selectedReading.thumbnail_alt || "",
        meta_title: selectedReading.meta_title || "",
        meta_description: selectedReading.meta_description || "",
        meta_keywords: selectedReading.meta_keywords || ""
      })

      // Set thumbnail preview from existing thumbnail
      if (selectedReading.thumbnail) {
        const thumbnailUrl = getReadingThumbnailUrl(selectedReading.thumbnail)
        setThumbnailPreview(thumbnailUrl)
      } else {
        setThumbnailPreview(null)
      }
    } else {
      // Reset form for new reading
      setReadingForm({
        title: "",
        content: "",
        excerpt: "",
        category: "artikel",
        level: "N5",
        is_published: 0,
        thumbnail: "",
        thumbnail_alt: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: ""
      })
      setThumbnailPreview(null)
    }
    setThumbnailFile(null)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [selectedReading])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      // Small delay to prevent flash when reopening
      const timer = setTimeout(() => {
        if (!selectedReading) {
          setReadingForm({
            title: "",
            content: "",
            excerpt: "",
            category: "artikel",
            level: "N5",
            is_published: 0,
            thumbnail: "",
            thumbnail_alt: "",
            meta_title: "",
            meta_description: "",
            meta_keywords: ""
          })
          setThumbnailPreview(null)
          setThumbnailFile(null)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [open, selectedReading])

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "File terlalu besar. Maksimal 5MB", variant: "destructive" })
        return
      }
      if (!file.type.startsWith("image/")) {
        toast({ title: "Error", description: "File harus berupa gambar", variant: "destructive" })
        return
      }
      setThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    // Also clear the thumbnail field in form
    setReadingForm(prev => ({ ...prev, thumbnail: "" }))
  }

  const uploadReadingThumbnail = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('thumbnail', file)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/api/reading/upload-thumbnail`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
        body: formData
      })
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error("Server returned non-JSON response")
        return null
      }
      
      const data = await response.json()
      if (data.success) return data.data.filename
      return null
    } catch (error) {
      console.error("Error uploading thumbnail:", error)
      return null
    }
  }

  const handleSave = async () => {
    if (!readingForm.title || !readingForm.content) {
      toast({ title: "Error", description: "Title dan Content wajib diisi", variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      let thumbnailUrl = readingForm.thumbnail
      
      // Upload new thumbnail if selected
      if (thumbnailFile) {
        const uploadedFilename = await uploadReadingThumbnail(thumbnailFile)
        if (uploadedFilename) {
          thumbnailUrl = uploadedFilename
        } else {
          toast({ title: "Warning", description: "Gagal upload thumbnail, melanjutkan tanpa thumbnail", variant: "default" })
        }
      }

      const readingData = { 
        ...readingForm, 
        thumbnail: thumbnailUrl 
      }

      let result
      if (selectedReading) {
        result = await readingAPI.update(selectedReading.id, readingData)
        toast({ title: "Success", description: "Reading updated successfully" })
      } else {
        result = await readingAPI.create(readingData)
        toast({ title: "Success", description: "Reading created successfully" })
      }
      
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error saving reading:", error)
      toast({ 
        title: "Error", 
        description: error.response?.data?.error || "Failed to save reading", 
        variant: "destructive" 
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Get display thumbnail URL
  const displayThumbnail = thumbnailPreview || getReadingThumbnailUrl(readingForm.thumbnail)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedReading ? "Edit Artikel Reading" : "Tambah Artikel Reading Baru"}</DialogTitle>
          <DialogDescription>
            Isi informasi artikel bacaan di bawah ini. Gunakan format furigana: [teks]&#123;furigana&#125;
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Thumbnail Upload */}
          <div>
            <Label>Thumbnail / Cover Image</Label>
            <div className="mt-2">
              {displayThumbnail ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted mb-3">
                  <img 
                    src={displayThumbnail} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Failed to load thumbnail:", displayThumbnail)
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <button 
                    type="button"
                    onClick={removeThumbnail} 
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-full h-32 rounded-lg border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 mb-3"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Klik untuk upload thumbnail</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, JPEG, WEBP. Maks 5MB</p>
                </div>
              )}
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleThumbnailSelect} 
              />
            </div>
          </div>

          <div>
            <Label>Thumbnail Alt Text</Label>
            <Input 
              value={readingForm.thumbnail_alt} 
              onChange={(e) => setReadingForm({ ...readingForm, thumbnail_alt: e.target.value })} 
              placeholder="Deskripsi gambar untuk SEO"
            />
          </div>

          <div>
            <Label>Title *</Label>
            <Input 
              value={readingForm.title} 
              onChange={(e) => setReadingForm({ ...readingForm, title: e.target.value })} 
              placeholder="Judul artikel"
            />
          </div>

          <div>
            <Label>Content * (dengan format furigana)</Label>
            <Textarea 
              rows={8} 
              value={readingForm.content} 
              onChange={(e) => setReadingForm({ ...readingForm, content: e.target.value })} 
              placeholder='Tulis konten artikel di sini. Gunakan format furigana: [teks]{furigana} contoh: [日本]{にほん}は...'
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tips: Gunakan format [teks]&#123;furigana&#125; untuk menampilkan furigana. Contoh: [日本]&#123;にほん&#125;
            </p>
          </div>

          <div>
            <Label>Excerpt (Ringkasan)</Label>
            <Textarea 
              rows={3} 
              value={readingForm.excerpt} 
              onChange={(e) => setReadingForm({ ...readingForm, excerpt: e.target.value })} 
              placeholder="Ringkasan singkat artikel untuk tampilan daftar"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Level</Label>
              <Select value={readingForm.level} onValueChange={(v) => setReadingForm({ ...readingForm, level: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N5">N5</SelectItem>
                  <SelectItem value="N4">N4</SelectItem>
                  <SelectItem value="N3">N3</SelectItem>
                  <SelectItem value="N2">N2</SelectItem>
                  <SelectItem value="N1">N1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={readingForm.category} onValueChange={(v) => setReadingForm({ ...readingForm, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artikel">Artikel</SelectItem>
                  <SelectItem value="cerita">Cerita</SelectItem>
                  <SelectItem value="berita">Berita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="text-base font-semibold">SEO / Meta Tags</Label>
            <div className="space-y-3 mt-2">
              <div>
                <Label>Meta Title</Label>
                <Input 
                  value={readingForm.meta_title} 
                  onChange={(e) => setReadingForm({ ...readingForm, meta_title: e.target.value })} 
                  placeholder="Title untuk SEO (kosongkan untuk menggunakan title)"
                />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea 
                  rows={2} 
                  value={readingForm.meta_description} 
                  onChange={(e) => setReadingForm({ ...readingForm, meta_description: e.target.value })} 
                  placeholder="Deskripsi untuk SEO"
                />
              </div>
              <div>
                <Label>Meta Keywords</Label>
                <Input 
                  value={readingForm.meta_keywords} 
                  onChange={(e) => setReadingForm({ ...readingForm, meta_keywords: e.target.value })} 
                  placeholder="Keyword, dipisah koma"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={String(readingForm.is_published)} onValueChange={(v) => setReadingForm({ ...readingForm, is_published: parseInt(v) })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Draft</SelectItem>
                <SelectItem value="1">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {selectedReading ? "Update" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}