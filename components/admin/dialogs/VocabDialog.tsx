"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

interface VocabDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedVocab?: any
  onSuccess: () => void
}

export function VocabDialog({ open, onOpenChange, selectedVocab, onSuccess }: VocabDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [vocabForm, setVocabForm] = useState({
    kanji: selectedVocab?.kanji || "",
    hiragana: selectedVocab?.hiragana || "",
    romaji: selectedVocab?.romaji || "",
    arti: selectedVocab?.arti || "",
    contoh_kalimat: selectedVocab?.contoh_kalimat || "",
    contoh_arti: selectedVocab?.contoh_arti || "",
    jlpt_level: selectedVocab?.jlpt_level || "N5",
    kategori_id: selectedVocab?.kategori_id || ""
  })

  const handleSave = async () => {
    if (!vocabForm.kanji || !vocabForm.hiragana || !vocabForm.arti) {
      toast({ title: "Error", description: "Kanji, Hiragana, dan Arti wajib diisi", variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      if (selectedVocab) {
        await adminAPI.updateVocab(selectedVocab.id, vocabForm)
        toast({ title: "Success", description: "Vocabulary updated successfully" })
      } else {
        await adminAPI.createVocab(vocabForm)
        toast({ title: "Success", description: "Vocabulary created successfully" })
      }
      onSuccess()
      onOpenChange(false)
      setVocabForm({
        kanji: "", hiragana: "", romaji: "", arti: "",
        contoh_kalimat: "", contoh_arti: "", jlpt_level: "N5", kategori_id: ""
      })
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to save vocabulary", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{selectedVocab ? "Edit Kosakata" : "Tambah Kosakata Baru"}</DialogTitle>
          <DialogDescription>Isi informasi kosakata di bawah ini.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Kanji</Label><Input value={vocabForm.kanji} onChange={(e) => setVocabForm({ ...vocabForm, kanji: e.target.value })} /></div>
            <div><Label>Hiragana</Label><Input value={vocabForm.hiragana} onChange={(e) => setVocabForm({ ...vocabForm, hiragana: e.target.value })} /></div>
          </div>
          <div><Label>Arti</Label><Input value={vocabForm.arti} onChange={(e) => setVocabForm({ ...vocabForm, arti: e.target.value })} /></div>
          <div><Label>Contoh Kalimat</Label><Textarea value={vocabForm.contoh_kalimat} onChange={(e) => setVocabForm({ ...vocabForm, contoh_kalimat: e.target.value })} /></div>
          <div><Label>Arti Contoh</Label><Input value={vocabForm.contoh_arti} onChange={(e) => setVocabForm({ ...vocabForm, contoh_arti: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>JLPT Level</Label>
              <Select value={vocabForm.jlpt_level} onValueChange={(v) => setVocabForm({ ...vocabForm, jlpt_level: v })}>
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
            <div><Label>Kategori ID</Label><Input type="number" value={vocabForm.kategori_id} onChange={(e) => setVocabForm({ ...vocabForm, kategori_id: e.target.value })} /></div>
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