"use client"

import { useState, useRef, useEffect } from "react" // Tambahkan useEffect
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, X, PlusCircle, MinusCircle } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

interface ExampleSentence {
  japanese: string
  indonesian: string
  romaji?: string
}

interface Conversation {
  speaker: string
  japanese: string
  indonesian: string
  romaji?: string
}

interface GrammarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedGrammar?: any
  onSuccess: () => void
}

const getThumbnailUrl = (thumbnail: string | null | undefined): string | null => {
  if (!thumbnail) return null
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.pipinipon.site'
  return `${baseUrl}/uploads/grammar/${thumbnail}`
}

const parseJsonField = (field: any) => {
  if (!field) return []
  if (typeof field === 'string') {
    try { return JSON.parse(field) } catch { return [] }
  }
  return field
}

export function GrammarDialog({ open, onOpenChange, selectedGrammar, onSuccess }: GrammarDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [grammarForm, setGrammarForm] = useState({
    title: "",
    pattern: "",
    meaning: "",
    explanation: "",
    level: "N5",
    category: "",
    is_published: 0,
    thumbnail: "",
    thumbnail_alt: "",
    notes: ""
  })

  const [exampleSentences, setExampleSentences] = useState<ExampleSentence[]>([
    { japanese: "", indonesian: "", romaji: "" }
  ])

  const [conversations, setConversations] = useState<Conversation[]>([
    { speaker: "", japanese: "", indonesian: "", romaji: "" }
  ])

  // Update form when selectedGrammar changes
  useEffect(() => {
    if (selectedGrammar) {
      console.log("Loading grammar data:", selectedGrammar)
      
      setGrammarForm({
        title: selectedGrammar.title || "",
        pattern: selectedGrammar.pattern || "",
        meaning: selectedGrammar.meaning || "",
        explanation: selectedGrammar.explanation || "",
        level: selectedGrammar.level || "N5",
        category: selectedGrammar.category || "",
        is_published: selectedGrammar.is_published || 0,
        thumbnail: selectedGrammar.thumbnail || "",
        thumbnail_alt: selectedGrammar.thumbnail_alt || "",
        notes: selectedGrammar.notes || ""
      })

      // Parse contoh kalimat
      const parsedExamples = parseJsonField(selectedGrammar.example_sentences)
      if (parsedExamples.length > 0) {
        setExampleSentences(parsedExamples)
      } else {
        setExampleSentences([{ japanese: "", indonesian: "", romaji: "" }])
      }

      // Parse percakapan
      const parsedConversations = parseJsonField(selectedGrammar.conversations)
      if (parsedConversations.length > 0) {
        setConversations(parsedConversations)
      } else {
        setConversations([{ speaker: "", japanese: "", indonesian: "", romaji: "" }])
      }

      // Set thumbnail preview
      const thumbnailUrl = getThumbnailUrl(selectedGrammar.thumbnail)
      setThumbnailPreview(thumbnailUrl)
    } else {
      // Reset form when no selectedGrammar (add new mode)
      setGrammarForm({
        title: "", pattern: "", meaning: "", explanation: "",
        level: "N5", category: "", is_published: 0,
        thumbnail: "", thumbnail_alt: "", notes: ""
      })
      setExampleSentences([{ japanese: "", indonesian: "", romaji: "" }])
      setConversations([{ speaker: "", japanese: "", indonesian: "", romaji: "" }])
      setThumbnailPreview(null)
    }
    setThumbnailFile(null)
  }, [selectedGrammar])

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
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const uploadThumbnail = async (file: File): Promise<string | null> => {
    try {
      const response = await adminAPI.uploadGrammarThumbnail(file)
      if (response.data.success) return response.data.data.filename
      return null
    } catch (error) {
      console.error("Error uploading thumbnail:", error)
      return null
    }
  }

  const addExampleSentence = () => {
    setExampleSentences([...exampleSentences, { japanese: "", indonesian: "", romaji: "" }])
  }

  const removeExampleSentence = (index: number) => {
    setExampleSentences(exampleSentences.filter((_, i) => i !== index))
  }

  const updateExampleSentence = (index: number, field: keyof ExampleSentence, value: string) => {
    const updated = [...exampleSentences]
    updated[index][field] = value
    setExampleSentences(updated)
  }

  const addConversation = () => {
    setConversations([...conversations, { speaker: "", japanese: "", indonesian: "", romaji: "" }])
  }

  const removeConversation = (index: number) => {
    setConversations(conversations.filter((_, i) => i !== index))
  }

  const updateConversation = (index: number, field: keyof Conversation, value: string) => {
    const updated = [...conversations]
    updated[index][field] = value
    setConversations(updated)
  }

  const handleSave = async () => {
    if (!grammarForm.title || !grammarForm.pattern || !grammarForm.meaning) {
      toast({ title: "Error", description: "Title, Pattern, dan Meaning wajib diisi", variant: "destructive" })
      return
    }

    setSubmitting(true)
    setUploadingThumbnail(true)

    try {
      let thumbnailUrl = grammarForm.thumbnail
      if (thumbnailFile) {
        const uploadedFilename = await uploadThumbnail(thumbnailFile)
        if (uploadedFilename) {
          thumbnailUrl = uploadedFilename
        } else {
          toast({ title: "Error", description: "Gagal upload thumbnail", variant: "destructive" })
          return
        }
      }

      const validExamples = exampleSentences.filter(ex => ex.japanese.trim() && ex.indonesian.trim())
      const validConversations = conversations.filter(conv => conv.speaker.trim() && conv.japanese.trim() && conv.indonesian.trim())

      const grammarData = {
        ...grammarForm,
        thumbnail: thumbnailUrl,
        example_sentences: JSON.stringify(validExamples),
        conversations: JSON.stringify(validConversations)
      }

      if (selectedGrammar) {
        await adminAPI.updateGrammar(selectedGrammar.id, grammarData)
        toast({ title: "Success", description: "Grammar updated successfully" })
      } else {
        await adminAPI.createGrammar(grammarData)
        toast({ title: "Success", description: "Grammar created successfully" })
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error saving grammar:", error)
      toast({ title: "Error", description: error.response?.data?.error || "Failed to save grammar", variant: "destructive" })
    } finally {
      setSubmitting(false)
      setUploadingThumbnail(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedGrammar ? "Edit Grammar" : "Tambah Grammar Baru"}</DialogTitle>
          <DialogDescription>Isi informasi tata bahasa di bawah ini.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Thumbnail Upload */}
          <div>
            <Label>Thumbnail / Cover Image</Label>
            <div className="mt-2">
              {thumbnailPreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted mb-3">
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  <button onClick={removeThumbnail} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 rounded-lg border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 mb-3">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Klik untuk upload thumbnail</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, JPEG, WEBP. Maks 5MB</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailSelect} />
            </div>
          </div>

          <div>
            <Label>Thumbnail Alt Text</Label>
            <Input 
              value={grammarForm.thumbnail_alt} 
              onChange={(e) => setGrammarForm({ ...grammarForm, thumbnail_alt: e.target.value })} 
            />
          </div>

          <div>
            <Label>Title *</Label>
            <Input 
              value={grammarForm.title} 
              onChange={(e) => setGrammarForm({ ...grammarForm, title: e.target.value })} 
            />
          </div>

          <div>
            <Label>Pattern *</Label>
            <Input 
              value={grammarForm.pattern} 
              onChange={(e) => setGrammarForm({ ...grammarForm, pattern: e.target.value })} 
            />
          </div>

          <div>
            <Label>Meaning *</Label>
            <Input 
              value={grammarForm.meaning} 
              onChange={(e) => setGrammarForm({ ...grammarForm, meaning: e.target.value })} 
            />
          </div>

          <div>
            <Label>Explanation</Label>
            <Textarea 
              rows={4} 
              value={grammarForm.explanation} 
              onChange={(e) => setGrammarForm({ ...grammarForm, explanation: e.target.value })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Level</Label>
              <Select value={grammarForm.level} onValueChange={(v) => setGrammarForm({ ...grammarForm, level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Input 
                value={grammarForm.category} 
                onChange={(e) => setGrammarForm({ ...grammarForm, category: e.target.value })} 
              />
            </div>
          </div>

          <div>
            <Label>Notes / Catatan Tambahan</Label>
            <Textarea 
              rows={3} 
              value={grammarForm.notes} 
              onChange={(e) => setGrammarForm({ ...grammarForm, notes: e.target.value })} 
            />
          </div>

          {/* Contoh Kalimat Section */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <Label className="text-base font-semibold">Contoh Kalimat</Label>
              <Button type="button" variant="outline" size="sm" onClick={addExampleSentence}>
                <PlusCircle className="h-4 w-4 mr-1" /> Tambah
              </Button>
            </div>
            <div className="space-y-3">
              {exampleSentences.map((example, idx) => (
                <div key={idx} className="p-3 border rounded-lg bg-muted/20">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">Contoh #{idx + 1}</span>
                    {exampleSentences.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeExampleSentence(idx)}>
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Kalimat Jepang *"
                      value={example.japanese}
                      onChange={(e) => updateExampleSentence(idx, "japanese", e.target.value)}
                    />
                    <Input
                      placeholder="Terjemahan Indonesia *"
                      value={example.indonesian}
                      onChange={(e) => updateExampleSentence(idx, "indonesian", e.target.value)}
                    />
                    <Input
                      placeholder="Romaji (opsional)"
                      value={example.romaji || ""}
                      onChange={(e) => updateExampleSentence(idx, "romaji", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Percakapan Section */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <Label className="text-base font-semibold">Percakapan</Label>
              <Button type="button" variant="outline" size="sm" onClick={addConversation}>
                <PlusCircle className="h-4 w-4 mr-1" /> Tambah
              </Button>
            </div>
            <div className="space-y-3">
              {conversations.map((conv, idx) => (
                <div key={idx} className="p-3 border rounded-lg bg-muted/20">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">Percakapan #{idx + 1}</span>
                    {conversations.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeConversation(idx)}>
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Speaker (A/B/C) *"
                      value={conv.speaker}
                      onChange={(e) => updateConversation(idx, "speaker", e.target.value)}
                    />
                    <Input
                      placeholder="Kalimat Jepang *"
                      value={conv.japanese}
                      onChange={(e) => updateConversation(idx, "japanese", e.target.value)}
                    />
                    <Input
                      placeholder="Terjemahan Indonesia *"
                      value={conv.indonesian}
                      onChange={(e) => updateConversation(idx, "indonesian", e.target.value)}
                    />
                    <Input
                      placeholder="Romaji (opsional)"
                      value={conv.romaji || ""}
                      onChange={(e) => updateConversation(idx, "romaji", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={String(grammarForm.is_published)} onValueChange={(v) => setGrammarForm({ ...grammarForm, is_published: parseInt(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}